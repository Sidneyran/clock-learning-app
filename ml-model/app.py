from flask import Flask, request, jsonify
from flask_cors import CORS  # 👈 加这一行
import joblib
import numpy as np
from utils import prepare_input

app = Flask(__name__)
CORS(app)  # 👈 加这一行，允许所有前端跨域请求

model = joblib.load("recommendation_model.joblib")

@app.route('/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    try:
        if "avg_time" not in data and "time_taken" in data:
            data["avg_time"] = data["time_taken"]
        if "last_level" not in data:
            raise KeyError("last_level")
        features = prepare_input(data)
        prediction = model.predict(np.array(features).reshape(1, -1))[0]
        return jsonify({'recommended_level': int(prediction)})
    except KeyError as e:
        return jsonify({'error': f"Missing required field: {str(e)}"}), 400
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)