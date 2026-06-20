# backend/contract_bot.py

import os
import sys
import json
import argparse
import shutil

from langchain.vectorstores import FAISS
from langchain.document_loaders import PyMuPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

class ContractAnalyzer:
    def __init__(self, api_key=None):
        if api_key:
            os.environ["GOOGLE_API_KEY"] = api_key
        elif not os.environ.get("GOOGLE_API_KEY"):
            raise ValueError("GOOGLE_API_KEY environment variable is not set")

        self.embedding_model = GoogleGenerativeAIEmbeddings(model="models/text-embedding-004")
        self.llm = ChatGoogleGenerativeAI(model="gemini-2.0-flash", temperature=0.3)

        self.vectorstore = None
        self.qa_chain = None
        self.documents = None
        self.document_path = None

        self.setup_prompt_template()

    def setup_prompt_template(self):
        template = """
        You are a legal contract analysis assistant.
        Use the provided context to answer the user's question.
        Rules:
        - If relevant context exists, first write the main answer without any references.
        - After the main answer, in a new paragraph, list references (page numbers, article numbers, etc.) in parentheses like (Page X), (Article Y).
        - Never make up references. Only use those present in the provided context.
        - Be precise and professional in your responses.

        Context:
        {context}

        Question:
        {question}

        Answer:
        """
        self.prompt = PromptTemplate(template=template, input_variables=["context", "question"])

    def load_document(self, file_path):
        try:
            self.document_path = file_path
            loader = PyMuPDFLoader(file_path)
            self.documents = loader.load()

            splitter = RecursiveCharacterTextSplitter(chunk_size=1500, chunk_overlap=300)
            docs = splitter.split_documents(self.documents)

            self.vectorstore = FAISS.from_documents(docs, self.embedding_model)
            self._setup_qa_chain()
            return True
        except Exception as e:
            sys.stderr.write(f"Error loading document: {str(e)}\n")
            return False

    def save_index(self, session_id):
        if self.vectorstore:
            os.makedirs("vectorstore", exist_ok=True)
            self.vectorstore.save_local(f"vectorstore/{session_id}")

    def load_index(self, session_id):
        index_path = f"vectorstore/{session_id}"
        if os.path.exists(index_path):
            self.vectorstore = FAISS.load_local(index_path, self.embedding_model, allow_dangerous_deserialization=True)
            self._setup_qa_chain()
            return True
        return False

    def _setup_qa_chain(self):
        retriever = self.vectorstore.as_retriever(search_kwargs={"k": 20})
        self.qa_chain = RetrievalQA.from_chain_type(
            llm=self.llm,
            retriever=retriever,
            chain_type="stuff",
            return_source_documents=True,
            chain_type_kwargs={"prompt": self.prompt, "verbose": False}
        )

    def ask_question(self, query):
        if not self.qa_chain:
            return "Please upload a contract first before asking questions."
        try:
            result = self.qa_chain({"query": query})
            return result["result"]
        except Exception as e:
            sys.stderr.write(f"Error processing query: {str(e)}\n")
            return "Sorry, I encountered an error while processing your question."

    def analyze_contract(self):
        return {"message": "Contract loaded. Ready for questions."}

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--mode", required=True, choices=["analyze", "chat"])
    parser.add_argument("--file", type=str, help="Path to PDF file (for analyze mode)")
    parser.add_argument("--session", type=str, help="Session ID")
    parser.add_argument("--query", type=str, help="Question text (for chat mode)")
    args = parser.parse_args()

    analyzer = ContractAnalyzer()

    if args.mode == "analyze":
        if not args.file or not args.session:
            sys.stderr.write("Missing --file or --session\n")
            sys.exit(1)
            
        success = analyzer.load_document(args.file)
        if success:
            analyzer.save_index(args.session)
            print(json.dumps(analyzer.analyze_contract()))
        else:
            print(json.dumps({"error": "Failed to load document"}))
            sys.exit(1)

    elif args.mode == "chat":
        if not args.session or not args.query:
            sys.stderr.write("Missing --session or --query\n")
            sys.exit(1)
            
        success = analyzer.load_index(args.session)
        if success:
            answer = analyzer.ask_question(args.query)
            print(json.dumps({"response": answer}))
        else:
            print(json.dumps({"error": "Session not found or expired"}))
            sys.exit(1)
