import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.tree import DecisionTreeClassifier
from sklearn.naive_bayes import MultinomialNB
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import pickle
import warnings
warnings.filterwarnings('ignore')

print("Loading dataset...")

# Load Sentiment140 dataset
# Column names: target, ids, date, flag, user, text
df = pd.read_csv('training.1600000.processed.noemoticon.csv', 
                 encoding='latin-1', 
                 header=None,
                 names=['target', 'ids', 'date', 'flag', 'user', 'text'])

print(f"Dataset loaded: {len(df)} rows")

# Use only text and target columns
# Target: 0 = negative, 4 = positive
df = df[['text', 'target']]

# Convert target to binary: 0=negative, 1=positive
#df['sentiment'] = df['target'].apply(lambda x: 'positive' if x == 4 else 'negative')
# Convert target to binary: 0=negative, 4=positive
df['sentiment'] = df['target'].apply(lambda x: 1 if x == 4 else 0)

# Check class distribution
# Ensure balanced dataset
df = df.groupby('sentiment').apply(lambda x: x.sample(min(5000, len(x)))).reset_index(drop=True)
print(f"\nBalanced dataset: {len(df)} rows")
print(df['sentiment'].value_counts())
print(f"\nClass distribution:")
print(df['sentiment'].value_counts())
# Use subset for faster training (first 10000 rows)
df = df.head(10000)
print(f"Using {len(df)} rows for training")

# Remove missing values
df = df.dropna()

# Prepare data
X = df['text']
y = df['sentiment']

print("\nVectorizing text data...")
# Vectorize text
vectorizer = TfidfVectorizer(max_features=5000, max_df=0.8, min_df=2)
X_vectorized = vectorizer.fit_transform(X)

print("Splitting data...")
# Split data (80% train, 20% test)
X_train, X_test, y_train, y_test = train_test_split(
    X_vectorized, y, test_size=0.2, random_state=42
)

print(f"Training set: {X_train.shape[0]} samples")
print(f"Test set: {X_test.shape[0]} samples\n")

# Train multiple models
models = {
    'Logistic Regression': LogisticRegression(max_iter=1000, random_state=42),
    'Naive Bayes': MultinomialNB(),
    'Decision Tree': DecisionTreeClassifier(max_depth=50, random_state=42),
    'Random Forest': RandomForestClassifier(n_estimators=100, max_depth=50, random_state=42),
    'SVM': SVC(kernel='linear', random_state=42)
}

results = {}
best_model = None
best_accuracy = 0
best_model_name = ""

print("=" * 70)
print("TRAINING AND EVALUATING MODELS")
print("=" * 70)

for name, model in models.items():
    print(f"\n{'='*70}")
    print(f"Training {name}...")
    print(f"{'='*70}")
    
    # Train
    model.fit(X_train, y_train)
    
    # Predict
    y_pred = model.predict(X_test)
    
    # Evaluate
    accuracy = accuracy_score(y_test, y_pred)
    results[name] = accuracy
    
    print(f"\n{name} Results:")
    print(f"Accuracy: {accuracy * 100:.2f}%")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Track best model
    if accuracy > best_accuracy:
        best_accuracy = accuracy
        best_model = model
        best_model_name = name

print("\n" + "=" * 70)
print("FINAL RESULTS")
print("=" * 70)

print("\nAll Model Accuracies:")
for name, acc in sorted(results.items(), key=lambda x: x[1], reverse=True):
    print(f"{name:25} : {acc * 100:.2f}%")

print(f"\n🏆 BEST MODEL: {best_model_name}")
print(f"🎯 ACCURACY: {best_accuracy * 100:.2f}%")

# Save best model and vectorizer
print("\nSaving best model...")
with open('best_model.pkl', 'wb') as f:
    pickle.dump(best_model, f)

with open('vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)

with open('model_info.txt', 'w') as f:
    f.write(f"Best Model: {best_model_name}\n")
    f.write(f"Accuracy: {best_accuracy * 100:.2f}%\n")
    f.write(f"Training samples: {X_train.shape[0]}\n")
    f.write(f"Test samples: {X_test.shape[0]}\n")
    f.write("\nAll Model Results:\n")
    for name, acc in sorted(results.items(), key=lambda x: x[1], reverse=True):
        f.write(f"{name}: {acc * 100:.2f}%\n")

print("\n✅ Model saved successfully!")
print(f"Files created: best_model.pkl, vectorizer.pkl, model_info.txt")