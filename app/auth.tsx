import { LinearGradient } from 'expo-linear-gradient';
import { useState } from "react";
import { Dimensions, Image, ImageBackground, KeyboardAvoidingView, Platform, StyleSheet, TouchableOpacity, View } from "react-native";
import { Card, Text, TextInput, useTheme } from "react-native-paper";
import { useAuth } from "../context/authprov";

const { width, height } = Dimensions.get('window');

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const theme = useTheme();

  // Correctly load the local image using 'require' with a relative path
  const image = require("./components/bgimg.png");
  // Get signIn and signUp functions from the auth context
  const { signIn, signUp, requestPasswordReset } = useAuth();

  const handleSwitchMode = () => {
    setIsSignUp((prev) => !prev);
    setError(null); // Clear errors when switching
    setConfirmPassword(""); // Clear confirm password when switching modes
  };

  const handleAuth = async () => {
    setError(null); // Clear previous errors
    setInfo(null);

    // Basic validation checks
    if (!email || !password) {
      setError("Please fill in all fields");
    }

    if (isSignUp && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    // Call the correct authentication function
    if (isSignUp) {
      const err = await signUp(email, password);
      if (err) {
        setError(err);
      }
    } else {
      const err = await signIn(email, password);
      if (err) {
        setError(err);
      }
    }
  };

  const handleForgotPassword = async () => {
    setError(null);
    setInfo(null);
    if (!email) {
      setError("Please enter your email to reset your password");
      return;
    }
    const err = await requestPasswordReset(email);
    if (err) {
      setError(err);
    } else {
      setInfo("Password reset email sent. Check your inbox.");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
    <LinearGradient
      style={styles.content}
      colors={["#0B1B2B", "#0E2440", "#113354"]}
      start={{ x: 0.3, y: 0.1 }}
      end={{ x: 1, y: 0.9 }}
    >
      <ImageBackground source={image} style={styles.imageBackground} resizeMode="cover">
        <View style={styles.overlay} />
        <View style={styles.container}>
          <View style={styles.headerContainer}>
            <Image source={require("./components/logo.png")} style={styles.logo} />
          </View>

          <View style={styles.formCard}>
            <View style={styles.formContainer}>
              <Text variant="headlineMedium" style={styles.title}>
                {isSignUp ? "Create Account" : "Welcome Back"}
              </Text>
              <Text variant="bodyLarge" style={styles.subtitle}>
                {isSignUp ? "Sign up to get started" : "Sign in to your account"}
              </Text>

              <TextInput
                label="Email"
                placeholder="john@gmail.com"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                onChangeText={setEmail}
                value={email}
                mode="outlined"
                left={<TextInput.Icon icon="email" />}
                error={!!error && email.length > 0 && !email.includes('@')}
              />

              <TextInput
                label="Password"
                placeholder="Enter your password"
                autoCapitalize="none"
                style={styles.input}
                secureTextEntry={true}
                onChangeText={setPassword}
                value={password}
                mode="outlined"
                left={<TextInput.Icon icon="lock" />}
                error={!!error && password.length > 0 && password.length < 6}
              />

              {isSignUp && (
                <TextInput
                  label="Confirm Password"
                  placeholder="Confirm your password"
                  autoCapitalize="none"
                  mode="outlined"
                  style={styles.input}
                  secureTextEntry={true}
                  onChangeText={setConfirmPassword}
                  value={confirmPassword}
                  left={<TextInput.Icon icon="lock-check" />}
                  error={!!error && confirmPassword.length > 0 && password !== confirmPassword}
                />
              )}

              {error && (
                <Text variant="bodyMedium" style={styles.errorText}>
                  {error}
                </Text>
              )}

              {info && (
                <Text variant="bodyMedium" style={styles.infoText}>
                  {info}
                </Text>
              )}

              <TouchableOpacity
                style={[styles.signInButton, isLoading && styles.disabledButton]}
                onPress={handleAuth}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ["rgba(255,255,255,0.1)", "rgba(255,255,255,0.05)"] : ["#47BDCE", "#3A9BA8"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Please wait..." : (isSignUp ? "Sign Up" : "Sign In")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <View style={styles.switchContainer}>
                <TouchableOpacity onPress={handleForgotPassword} style={styles.linkButton}>
                  <Text style={styles.linkText}>Forgot password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSwitchMode} style={styles.linkButton}>
                  <Text style={styles.linkText}>
                    {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </ImageBackground>
    </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  imageBackground: {
    flex: 1,
    width: '100%',
    justifyContent: "center",
    alignItems: "center",
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    width: width * 0.6,
    height: width * 0.6,
    maxWidth: 300,
    maxHeight: 300,
    resizeMode: 'contain',
  },
  formCard: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  formContainer: {
    width: '100%',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    color: '#EAF2FF',
    fontWeight: '700',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#C6D4EA',
    opacity: 0.8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorText: {
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(211, 47, 47, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  infoText: {
    color: '#2e7d32',
    textAlign: 'center',
    marginBottom: 16,
    backgroundColor: 'rgba(46, 125, 50, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  signInButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  linkText: {
    color: '#47BDCE',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});