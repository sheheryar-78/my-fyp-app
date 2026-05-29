import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView, 
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Phone, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
// Note: In React Native you will need to setup axios exactly as you did for web,
// but for mobile make sure your baseURL points to your computer's local IP rather than localhost.
// import API from '../../services/api'; 
// import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login({ onLogin, navigation }) {
  const [isSignup, setIsSignup] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    setError('');
    try {
      if (isSignup) {
        const nameRegex = /^[A-Za-z\s]+$/;
        if (!nameRegex.test(formData.name)) {
          setError('Name should only contain alphabets and spaces.');
          return;
        }
        
        const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
        if (!passwordRegex.test(formData.password)) {
          setError('Password must be at least 8 characters long and contain at least one special character.');
          return;
        }

        // await API.post('/auth/signup', formData);
        Alert.alert('Success', 'Account created! Please login.');
        setIsSignup(false);
      } else {
        // const res = await API.post('/auth/login', {
        //   email: formData.email,
        //   password: formData.password,
        // });
        // await AsyncStorage.setItem('token', res.data.token);
        // await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
        
        onLogin(); // triggers App.js state change to show Main tabs
      }
    } catch (err) {
      console.log(err);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleForgotPassword = () => {
    if (!formData.email) {
      Alert.alert('Error', 'Please enter your email first!');
      return;
    }
    setIsResetting(true);
    setResetSuccess('');
  };

  const handleResetPassword = async () => {
    try {
      const passwordRegex = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        Alert.alert('Error', 'Password must be at least 8 characters long and contain at least one special character.');
        return;
      }

      // const res = await API.post('/auth/reset-password', {
      //   email: formData.email,
      //   newPassword,
      // });
      // setResetSuccess(res.data.message);
      
      setIsResetting(false);
      setNewPassword('');
    } catch (err) {
      console.log('Reset Password ERROR:', err);
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.formContainer}>
            
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoIcon}>
                <Phone color="white" size={32} />
              </View>
              <Text style={styles.title}>NexCall</Text>
              <Text style={styles.subtitle}>AI Voice Agent Platform</Text>
            </View>

            {/* Header */}
            <View style={styles.headerContainer}>
              <Text style={styles.headerTitle}>
                {isSignup ? 'Create your account' : isResetting ? 'Reset Password' : 'Welcome back'}
              </Text>
              <Text style={styles.headerSubtitle}>
                {isSignup
                  ? 'Start building AI voice agents today'
                  : isResetting
                  ? 'Enter a new password'
                  : 'Sign in to your account to continue'}
              </Text>
            </View>

            {/* Messages */}
            {!!error && <Text style={styles.errorText}>{error}</Text>}
            {!!resetSuccess && <Text style={styles.successText}>{resetSuccess}</Text>}

            {/* Form */}
            <View style={styles.inputsContainer}>
              
              {isSignup && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <User color="#9ca3af" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="John Smith"
                      value={formData.name}
                      onChangeText={(val) => handleChange('name', val)}
                    />
                  </View>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputWrapper}>
                  <Mail color="#9ca3af" size={20} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="you@company.com"
                    value={formData.email}
                    onChangeText={(val) => handleChange('email', val)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {!isResetting && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock color="#9ca3af" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      value={formData.password}
                      onChangeText={(val) => handleChange('password', val)}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity 
                      style={styles.eyeIcon} 
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff color="#9ca3af" size={20}/> : <Eye color="#9ca3af" size={20}/>}
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {!isSignup && !isResetting && (
                <TouchableOpacity style={styles.forgotPassword} onPress={handleForgotPassword}>
                  <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
              )}

              {isResetting && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>New Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock color="#9ca3af" size={20} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter new password"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      secureTextEntry
                    />
                  </View>
                  <TouchableOpacity style={styles.resetButton} onPress={handleResetPassword}>
                    <Text style={styles.submitButtonText}>Reset Password</Text>
                  </TouchableOpacity>
                </View>
              )}

              {!isResetting && (
                <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                  <Text style={styles.submitButtonText}>
                    {isSignup ? 'Create Account' : 'Sign In'}
                  </Text>
                  <ArrowRight color="white" size={20} style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}

            </View>

            {/* Toggle */}
            <View style={styles.toggleContainer}>
              <Text style={styles.toggleText}>
                {isSignup ? 'Already have an account? ' : "Don't have an account? "}
              </Text>
              <TouchableOpacity onPress={() => {
                setIsSignup(!isSignup);
                setIsResetting(false);
                setResetSuccess('');
              }}>
                <Text style={styles.toggleActionText}>
                  {isSignup ? 'Sign in' : 'Sign up'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6', // blue-50 equivalent
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    color: '#4b5563',
    marginTop: 8,
  },
  headerContainer: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#4b5563',
    marginTop: 4,
  },
  inputsContainer: {
    gap: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  eyeIcon: {
    padding: 4,
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  forgotPasswordText: {
    color: '#2563eb',
    fontWeight: '500',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  resetButton: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  toggleText: {
    color: '#4b5563',
  },
  toggleActionText: {
    color: '#2563eb',
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 12,
  },
  successText: {
    color: '#16a34a',
    textAlign: 'center',
    marginBottom: 12,
  }
});
