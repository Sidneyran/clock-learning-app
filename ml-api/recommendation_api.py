from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np
import pickle

app = Flask(__name__)
CORS(app)

# 载入模型
with open('recommendation_model.pkl', 'rb') as f:
    model = pickle.load(f)

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    accuracy = data.get('accuracy')
    time_taken = data.get('timeTaken')
    score = data.get('score', 0.7)  # 可选：如果需要第三个特征

    if accuracy is None or time_taken is None:
        return jsonify({'error': 'Missing accuracy or timeTaken'}), 400

    # 包含三个特征
    features = np.array([[accuracy, time_taken, score]])
    prediction = model.predict(features)[0]

    return jsonify({'recommendedLevel': prediction})

if __name__ == '__main__':
    app.run(port=5001, debug=True)