import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import ConversationChain
from langchain.prompts import PromptTemplate

class GeneralLegalBot:
    def __init__(self, api_key=None):
        if api_key:
            google_api_key = api_key
        else:
            google_api_key = os.environ.get("GOOGLE_API_KEY")
            if not google_api_key:
                raise ValueError("GOOGLE_API_KEY environment variable is not set")
        
        # llm
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash",
            google_api_key=google_api_key,
            temperature=0.2
        )
        
        # memory
        self.memory = ConversationBufferMemory(memory_key="history", return_messages=True)
        
        self.setup_prompt()
        
        # chain
        self.conversation = ConversationChain(
            llm=self.llm,
            memory=self.memory,
            prompt=self.prompt,
            verbose=False
        )
    
    def setup_prompt(self):
        prompt_template = """You are a helpful legal assistant specializing in providing accurate legal information.

Guidelines:
- Provide clear, concise answers in point-wise format when appropriate.
- Focus on factual legal information.
- If the question is complex, break it down into understandable parts.
- Always recommend consulting with a qualified attorney for specific legal matters.
- Be professional and accurate in your responses.
- If you're unsure about something, acknowledge it rather than guessing.

Conversation history:
{history}

User: {input}

Legal Assistant:"""
        
        self.prompt = PromptTemplate(
            input_variables=["history", "input"],
            template=prompt_template
        )
    
    def ask(self, query):
        try:
            response = self.conversation.predict(input=query)
            return response.strip()
        except Exception as e:
            print(f"Error in general legal bot: {str(e)}")
            return "I apologize, but I'm experiencing technical difficulties. Please try again later or consult with a qualified attorney for your legal question."
    
    def reset_conversation(self):
        self.memory.clear()


if __name__ == "__main__":
    import argparse
    import json
    import sys
    
    parser = argparse.ArgumentParser()
    parser.add_argument("--query", required=True, type=str)
    parser.add_argument("--session", type=str, default="default")
    args = parser.parse_args()

    # Note: For production with a true conversation, we would load/save 
    # history to disk here using the session ID. For now we will just 
    # instantiate the bot and answer the question.
    
    bot = GeneralLegalBot()
    answer = bot.ask(args.query)
    
    print(json.dumps({"response": answer}))
    sys.exit(0)
