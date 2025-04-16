import numpy as np

def prepare_input(features: dict):
    """
    Convert input feature dict to a numpy array suitable for model prediction.
    Expected features: {
        'accuracy': float,
        'avg_time': float,
        'last_level': int
    }
    """
    return np.array([[features['accuracy'], features['avg_time'], features['last_level']]])
