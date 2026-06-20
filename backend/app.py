# backend/app.py - Flask API Server
import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import logging
logging.getLogger("grpc").setLevel(logging.ERROR)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import tempfile
import uuid
from werkzeug.utils import secure_filename
import json
from datetime import datetime

# setup
from general_legal_bot import legal_bot
from contract_bot import ContractAnalyzer
from globals import contract_analyzers
from legal_bert_service import bp as contract_bp

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
VECTORSTORE_FOLDER = 'vectorstore'
ALLOWED_EXTENSIONS = {'pdf'}

app.register_blueprint(contract_bp, url_prefix="/api")

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(VECTORSTORE_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# frontend routes
@app.route('/')
def serve_frontend():
    return send_from_directory('../frontend', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('../frontend', path)

# api
@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})

@app.route('/api/chat/general', methods=['POST'])
def general_chat():
    try:
        data = request.get_json()
        message = data.get('message', '').strip()
        
        if not message:
            return jsonify({'error': 'no message'}), 400
        
        response = legal_bot(message)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error general chat: {str(e)}")
        return jsonify({'error': 'error'}), 500

@app.route('/api/contract/upload', methods=['POST'])
def upload_contract():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'no file'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'no file'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'pdf only'}), 400
        
        session_id = str(uuid.uuid4())
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, f"{session_id}_{filename}")
        file.save(filepath)
        
        contract_analyzer = ContractAnalyzer()
        contract_analyzer.load_document(filepath)
        contract_analyzers[session_id] = contract_analyzer
        
        analysis_result = contract_analyzer.analyze_contract()
        
        return jsonify({
            'session_id': session_id,
            'filename': filename,
            'analysis': analysis_result,
            'message': 'success'
        })
    except Exception as e:
        print(f"Error contract upload: {str(e)}")
        return jsonify({'error': f'error: {str(e)}'}), 500

@app.route('/api/contract/chat', methods=['POST'])
def contract_chat():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        message = data.get('message', '').strip()
        
        if not session_id or not message:
            return jsonify({'error': 'missing session or message'}), 400
        
        contract_analyzer = contract_analyzers.get(session_id)
        if not contract_analyzer:
            return jsonify({'error': 'no session'}), 404
        
        response = contract_analyzer.ask_question(message)
        
        return jsonify({
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error contract chat: {str(e)}")
        return jsonify({'error': 'error'}), 500

@app.route('/api/contract/analyze', methods=['POST'])
def analyze_contract():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if not session_id:
            return jsonify({'error': 'no session id'}), 400
        
        contract_analyzer = contract_analyzers.get(session_id)
        if not contract_analyzer:
            return jsonify({'error': 'no session'}), 404
        
        analysis = contract_analyzer.analyze_contract()
        
        return jsonify({
            'analysis': analysis,
            'timestamp': datetime.now().isoformat()
        })
    except Exception as e:
        print(f"Error contract analysis: {str(e)}")
        return jsonify({'error': 'error'}), 500


# cleanup
@app.route('/api/cleanup', methods=['POST'])
def cleanup_session():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        
        if session_id and session_id in contract_analyzers:
            del contract_analyzers[session_id]
            for filename in os.listdir(UPLOAD_FOLDER):
                if filename.startswith(session_id):
                    os.remove(os.path.join(UPLOAD_FOLDER, filename))
        
        return jsonify({'message': 'clean ok'})
    except Exception as e:
        print(f"Error cleanup: {str(e)}")
        return jsonify({'error': 'error'}), 500

if __name__ == '__main__':
    print("Starting app...")
    app.run(debug=True, host='0.0.0.0', port=5000)