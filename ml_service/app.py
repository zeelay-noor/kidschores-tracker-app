from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

# Load model and vectorizer
print("Loading model...")
with open('best_model.pkl', 'rb') as f:
    model = pickle.load(f)

with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

print("Model loaded successfully!")

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        text = data.get('text', '')
        
        # Vectorize text
        text_vectorized = vectorizer.transform([text])
        
        # Predict
        prediction = model.predict(text_vectorized)[0]
        probability = model.predict_proba(text_vectorized)[0]
        
        # Convert to sentiment
        sentiment = 'positive' if prediction == 1 else 'negative'
        confidence = float(max(probability)) * 100
        
        return jsonify({
            'sentiment': sentiment,
            'confidence': round(confidence, 2),
            'text': text
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ML Service is running', 'model': 'Logistic Regression'})

if __name__ == '__main__':
    app.run(port=5001, debug=True)