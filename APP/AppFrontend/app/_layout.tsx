import { Stack } from 'expo-router';
import React from 'react';
import {
  FaceDetectionProvider,
} from '@infinitered/react-native-mlkit-face-detection';

const FACE_DETECTION_OPTIONS = {
  performanceMode: 'accurate',
  landmarkMode: true,
  contourMode: true,
  classificationMode: true,
  minFaceSize: 0.05,
  isTrackingEnabled: true,
};

export default function Layout() {
  return (
    <FaceDetectionProvider options={FACE_DETECTION_OPTIONS}>
      <Stack screenOptions={{ headerShown: false }} />
    </FaceDetectionProvider>
  );
}