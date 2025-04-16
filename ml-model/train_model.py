# ml-model/train_model.py
import joblib
import numpy as np
from sklearn.tree import DecisionTreeClassifier

# 生成模拟数据（假数据训练）
def generate_data(n=10000):
    np.random.seed(42)
    accuracy = np.random.rand(n)
    time_taken = np.random.rand(n)
    attempts = np.random.randint(1, 6, size=n)

    # 简单规则生成标签
    level = []
    for acc, t, a in zip(accuracy, time_taken, attempts):
        if acc > 0.8 and t < 0.4:
            level.append(3)
        elif acc > 0.5:
            level.append(2)
        else:
            level.append(1)

    X = np.vstack([accuracy, time_taken, attempts]).T
    y = np.array(level)
    return X, y

# 训练模型
X, y = generate_data()
clf = DecisionTreeClassifier()
clf.fit(X, y)

# 保存模型
joblib.dump(clf, "recommendation_model.joblib")
print("✅ 模型已保存为 recommendation_model.joblib")