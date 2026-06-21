# LegalAI Pro

LegalAI Pro is a comprehensive legal technology platform designed to streamline contract analysis and provide instant legal assistance. Our tools are specifically designed for the legal domain to enhance efficiency and accuracy in legal practice.

## Features

### 1. Smart Contract Analyzer
- **Automated Analysis**: Upload PDF contracts for comprehensive analysis.
- **Risk Assessment**: Automated risk scoring and identification with detailed risk level categorization.
- **Key Terms Extraction**: Extract important contract terms, dates, parties, and durations.
- **Interactive Chat**: Contract-specific chat support using Google Gemini 2.0 Flash for detailed Q&A.


## Technology Stack

### Backend
- **Framework**: Node.js with Express
- **Architecture**: Microservices pattern executing Python child processes
- **AI/ML**: 
  - Google Generative AI (Gemini 2.0 Flash)
  - LangChain for RAG implementation
- **Document Processing**: PyMuPDF for PDF parsing
- **Vector Database**: FAISS for document embeddings

### Frontend
- **HTML5**: Modern semantic markup
- **CSS3**: Responsive design
- **JavaScript**: Vanilla JS for API communication and state management
- **File Upload**: Asynchronous multipart/form-data upload via fetch API

## Project Structure

```
LegalAI-Pro/
├── backend/
│   ├── server.js                 # Node.js Express API gateway
│   ├── contract_bot.py           # Python script for contract analysis (FAISS/Gemini)
│   ├── package.json              # Node.js dependencies
│   └── uploads/                  # Temporary upload directory
├── frontend/
│   ├── index.html                # Homepage
│   ├── contract-analyzer.html    # Contract analysis interface
│   ├── about.html                # About page
│   ├── contact.html              # Contact information
│   ├── css/                      # Stylesheets
│   └── js/                       # Client-side JavaScript
├── requirements.txt              # Python dependencies
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- Google API Key for Gemini

### 1. Clone the Repository
```bash
git clone https://github.com/algo-aryan/legalAI-pro.git
cd legalAI-pro
```

### 2. Install Dependencies
```bash
# Install Node.js dependencies
cd backend
npm install

# Install Python dependencies
cd ..
pip install -r requirements.txt
```

### 3. Environment Setup
You must set your Google API Key as an environment variable before running the application.
```bash
export GOOGLE_API_KEY="your_google_api_key_here"
```

### 4. Run the Application
```bash
cd backend
npm start
```

The API will be available at `http://localhost:5000/api`. The frontend can be served using any static web server (Vercel, Netlify) or by opening the HTML files directly.

## API Endpoints

### Contract Analysis
- `POST /api/contract/upload` - Upload and analyze a PDF contract (multipart/form-data)
- `POST /api/contract/chat` - Chat about uploaded contract using session ID


## Privacy & Security

- Local file processing
- Session-based data management using UUIDs
- No permanent storage of sensitive documents

## Legal Disclaimer

LegalAI Pro is a technology tool designed to assist legal professionals. It does not provide legal advice and should not replace professional legal consultation. Always consult with qualified attorneys for specific legal matters.

## License

This project is licensed under the MIT License - see the LICENSE file for details.