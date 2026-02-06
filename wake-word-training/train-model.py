#!/usr/bin/env python3
"""
Train custom "Friday" wake word model using TensorFlow
Uses generated samples + transfer learning from speech-commands base
"""

import os
import numpy as np
import tensorflow as tf
from tensorflow import keras
import librosa

SAMPLE_RATE = 16000
DURATION = 1.0  # seconds
N_MFCC = 40

def load_audio(filepath):
    """Load and preprocess audio file"""
    audio, sr = librosa.load(filepath, sr=SAMPLE_RATE, duration=DURATION)
    
    # Pad or trim to fixed length
    target_length = int(SAMPLE_RATE * DURATION)
    if len(audio) < target_length:
        audio = np.pad(audio, (0, target_length - len(audio)))
    else:
        audio = audio[:target_length]
    
    # Extract MFCC features
    mfcc = librosa.feature.mfcc(y=audio, sr=SAMPLE_RATE, n_mfcc=N_MFCC)
    return mfcc.T

def create_dataset():
    """Create training dataset from WAV files"""
    wav_dir = 'friday-wav'
    
    X = []
    y = []
    
    # Load Friday samples (label=1)
    for filename in os.listdir(wav_dir):
        if filename.endswith('.wav'):
            filepath = os.path.join(wav_dir, filename)
            mfcc = load_audio(filepath)
            X.append(mfcc)
            y.append(1)
    
    print(f"✅ Loaded {len(X)} Friday samples")
    
    # Generate negative samples (silence + noise, label=0)
    for i in range(len(X)):
        # Random noise
        noise = np.random.normal(0, 0.01, int(SAMPLE_RATE * DURATION))
        mfcc = librosa.feature.mfcc(y=noise, sr=SAMPLE_RATE, n_mfcc=N_MFCC).T
        X.append(mfcc)
        y.append(0)
    
    print(f"✅ Generated {len(X)//2} negative samples")
    
    return np.array(X), np.array(y)

def build_model(input_shape):
    """Build CNN model for wake word detection"""
    model = keras.Sequential([
        keras.layers.Input(shape=input_shape),
        keras.layers.Conv2D(32, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Conv2D(64, (3, 3), activation='relu'),
        keras.layers.MaxPooling2D((2, 2)),
        keras.layers.Flatten(),
        keras.layers.Dense(64, activation='relu'),
        keras.layers.Dropout(0.5),
        keras.layers.Dense(1, activation='sigmoid')
    ])
    
    model.compile(
        optimizer='adam',
        loss='binary_crossentropy',
        metrics=['accuracy']
    )
    
    return model

def train():
    print("🎯 Training 'Friday' wake word model...\n")
    
    # Load data
    X, y = create_dataset()
    
    # Reshape for CNN (add channel dimension)
    X = X.reshape(X.shape[0], X.shape[1], X.shape[2], 1)
    
    # Split train/test
    split = int(0.8 * len(X))
    X_train, X_test = X[:split], X[split:]
    y_train, y_test = y[:split], y[split:]
    
    print(f"\n📊 Dataset: {len(X_train)} train, {len(X_test)} test")
    print(f"📐 Input shape: {X_train[0].shape}\n")
    
    # Build and train
    model = build_model(X_train[0].shape)
    
    history = model.fit(
        X_train, y_train,
        epochs=20,
        batch_size=32,
        validation_data=(X_test, y_test),
        verbose=1
    )
    
    # Evaluate
    loss, accuracy = model.evaluate(X_test, y_test)
    print(f"\n✅ Test Accuracy: {accuracy*100:.2f}%")
    
    # Save model
    model.save('friday-wake-word-model.h5')
    print("\n💾 Model saved: friday-wake-word-model.h5")
    
    # Convert to TensorFlow.js
    os.system('tensorflowjs_converter --input_format keras friday-wake-word-model.h5 friday-tfjs-model/')
    print("✅ TensorFlow.js model: friday-tfjs-model/")

if __name__ == '__main__':
    train()
