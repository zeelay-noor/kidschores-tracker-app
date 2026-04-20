from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import numpy as np

app = Flask(__name__)
CORS(app)

# ✅ Load model
try:
    with open('chores_model.pkl', 'rb') as f:
        model = pickle.load(f)
    print('✅ Model loaded successfully!')
except Exception as e:
    print(f'❌ Error loading model: {e}')
    model = None

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'running',
        'model_loaded': model is not None
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if model is None:
            return jsonify({'error': 'Model not loaded'}), 500

        data = request.json
        print(f'📊 Received data: {data}')

        # ✅ Extract features
        age                 = float(data.get('age', 10))
        task_category       = float(data.get('task_category', 0))
        difficulty          = float(data.get('difficulty', 1))
        points              = float(data.get('points', 20))
        past_completion_rate= float(data.get('past_completion_rate', 0.5))
        current_streak      = float(data.get('current_streak', 0))
        total_tasks_assigned= float(data.get('total_tasks_assigned', 10))
        day_of_week         = float(data.get('day_of_week', 1))
        time_of_day         = float(data.get('time_of_day', 12))
        performance_level   = float(data.get('performance_level', 5))

        # ✅ 3 New engineered features
        streak_x_completion = current_streak * past_completion_rate
        age_x_difficulty    = age * difficulty
        points_x_completion = points * past_completion_rate

        # ✅ Feature array - same order as training!
        features = np.array([[
            age,
            task_category,
            difficulty,
            points,
            past_completion_rate,
            current_streak,
            total_tasks_assigned,
            day_of_week,
            time_of_day,
            performance_level,
            streak_x_completion,
            age_x_difficulty,
            points_x_completion
        ]])

        # ✅ Predict
        prediction    = model.predict(features)[0]
        probability   = model.predict_proba(features)[0]

        result = {
            'prediction':        int(prediction),
            'success_probability': round(float(probability[1]) * 100, 2),
            'fail_probability':    round(float(probability[0]) * 100, 2),
            'will_succeed':        bool(prediction == 1),
            'confidence':          round(float(max(probability)) * 100, 2)
        }

        print(f'✅ Prediction: {result}')
        return jsonify(result)

    except Exception as e:
        print(f'❌ Error: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print('🚀 Flask ML Service starting on port 5002...')
    app.run(host='0.0.0.0', port=5002, debug=True)