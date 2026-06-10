import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import Animated, {
  FadeIn,
  SlideInDown,
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import Svg, {
  Defs,
  ClipPath,
  Text as SvgText,
  Path,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { supabase } from '../supabase';
import { colors, fonts } from '../theme/colors';

const AnimatedPath = Animated.createAnimatedComponent(Path);

export function AuthScreen() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const lottieRef = useRef<LottieView>(null);

  const translateX1 = useSharedValue(0);
  const translateY1 = useSharedValue(0);
  const translateX2 = useSharedValue(0);
  const translateY2 = useSharedValue(0);

  useEffect(() => {
    lottieRef.current?.play();

    translateX1.value = withRepeat(
      withTiming(-200, {
        duration: 3500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    translateY1.value = withRepeat(
      withTiming(6, {
        duration: 2000,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );

    translateX2.value = withRepeat(
      withTiming(200, {
        duration: 2500,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    translateY2.value = withRepeat(
      withTiming(-6, {
        duration: 1500,
        easing: Easing.inOut(Easing.ease),
      }),
      -1,
      true
    );
  }, []);

  const animatedProps1 = useAnimatedProps(() => {
    const x = translateX1.value;
    const y = translateY1.value + 20;
    const yControl = translateY1.value + 12;
    const path = `M ${x} ${y} Q ${x + 50} ${yControl}, ${x + 100} ${y} T ${x + 200} ${y} T ${x + 300} ${y} T ${x + 400} ${y} T ${x + 500} ${y} T ${x + 600} ${y} L ${x + 600} 80 L ${x} 80 Z`;
    return { d: path };
  });

  const animatedProps2 = useAnimatedProps(() => {
    const x = translateX2.value - 200;
    const y = translateY2.value + 24;
    const yControl = translateY2.value + 32;
    const path = `M ${x} ${y} Q ${x + 50} ${yControl}, ${x + 100} ${y} T ${x + 200} ${y} T ${x + 300} ${y} T ${x + 400} ${y} T ${x + 500} ${y} T ${x + 600} ${y} L ${x + 600} 80 L ${x} 80 Z`;
    return { d: path };
  });

  const handleAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please fill in all credentials');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password,
        });
        if (error) throw error;
        setSuccessMsg('Verification email sent! Please check your inbox.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.container}>
          <Animated.View
            entering={SlideInDown.springify().damping(28).stiffness(160)}
            style={styles.card}
          >
            {/* Animated Branding */}
            <View style={styles.brandingContainer}>
              <LottieView
                ref={lottieRef}
                source={require('../../assets/birdy.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
              <View style={styles.brandWrapper}>
                <Svg width={200} height={50} viewBox="0 0 200 50">
                  <Defs>
                    <ClipPath id="text-clip">
                      <SvgText
                        fontSize="38"
                        fontWeight="700"
                        fontFamily={fonts.body}
                        letterSpacing={-0.5}
                        x="100"
                        y="38"
                        textAnchor="middle"
                      >
                        Stash
                      </SvgText>
                    </ClipPath>
                    <LinearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#34D399" />
                      <Stop offset="50%" stopColor="#3B82F6" />
                      <Stop offset="100%" stopColor="#8B5CF6" />
                    </LinearGradient>
                    <LinearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="0%">
                      <Stop offset="0%" stopColor="#EC4899" />
                      <Stop offset="50%" stopColor="#F59E0B" />
                      <Stop offset="100%" stopColor="#34D399" />
                    </LinearGradient>
                  </Defs>

                  {/* Base Background Text */}
                  <SvgText
                    fill="rgba(255, 255, 255, 0.15)"
                    fontSize="38"
                    fontWeight="700"
                    fontFamily={fonts.body}
                    letterSpacing={-0.5}
                    x="100"
                    y="38"
                    textAnchor="middle"
                  >
                    Stash
                  </SvgText>

                  {/* Wave 1 (Back Wave) */}
                  <AnimatedPath
                    animatedProps={animatedProps1}
                    fill="url(#grad1)"
                    opacity={0.6}
                    clipPath="url(#text-clip)"
                  />

                  {/* Wave 2 (Front Wave) */}
                  <AnimatedPath
                    animatedProps={animatedProps2}
                    fill="url(#grad2)"
                    opacity={0.85}
                    clipPath="url(#text-clip)"
                  />
                </Svg>
              </View>
            </View>

            {/* Segmented control tabs */}
            <View style={styles.tabContainer}>
              <Pressable
                onPress={() => {
                  setMode('signin');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={[
                  styles.tabBtn,
                  mode === 'signin' && styles.tabBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'signin' && styles.tabTextActive,
                  ]}
                >
                  SIGN IN
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setMode('signup');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                style={[
                  styles.tabBtn,
                  mode === 'signup' && styles.tabBtnActive,
                ]}
              >
                <Text
                  style={[
                    styles.tabText,
                    mode === 'signup' && styles.tabTextActive,
                  ]}
                >
                  SIGN UP
                </Text>
              </Pressable>
            </View>

            {/* Warning / success messages */}
            {errorMsg && (
              <Animated.View entering={FadeIn} style={styles.errorBanner}>
                <Feather name="alert-triangle" color="#EF4444" size={12} />
                <Text style={styles.errorText} numberOfLines={2}>
                  {errorMsg.toUpperCase()}
                </Text>
              </Animated.View>
            )}

            {successMsg && (
              <Animated.View entering={FadeIn} style={styles.successBanner}>
                <Feather name="check-circle" color={colors.accentCoral} size={12} />
                <Text style={styles.successText} numberOfLines={2}>
                  {successMsg}
                </Text>
              </Animated.View>
            )}

            {/* Input fields */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Feather
                  name="mail"
                  color={colors.textTertiary}
                  size={12}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Email address..."
                  placeholderTextColor={colors.textTertiary}
                  value={email}
                  onChangeText={(t) => {
                    setEmail(t);
                    setErrorMsg(null);
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <View style={styles.inputContainer}>
                <Feather
                  name="lock"
                  color={colors.textTertiary}
                  size={12}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Secure password..."
                  placeholderTextColor={colors.textTertiary}
                  value={password}
                  onChangeText={(t) => {
                    setPassword(t);
                    setErrorMsg(null);
                  }}
                  secureTextEntry
                  autoCapitalize="none"
                  autoCorrect={false}
                  style={styles.input}
                />
              </View>

              <Pressable
                onPress={handleAuth}
                disabled={loading}
                style={({ pressed }) => [
                  styles.submitBtn,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color="#000000" size="small" />
                ) : (
                  <>
                    <Feather
                      name={mode === 'signin' ? 'unlock' : 'user-plus'}
                      color="#000000"
                      size={13}
                    />
                    <Text style={styles.submitText}>
                      {mode === 'signin' ? 'AUTHENTICATE VAULT' : 'CREATE VAULT'}
                    </Text>
                  </>
                )}
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 28,
    padding: 22,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 4,
  },
  brandingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  brandWrapper: {
    height: 50,
    justifyContent: 'center',
  },
  lottie: {
    width: 64,
    height: 64,
  },
  tabContainer: {
    flexDirection: 'row',
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    padding: 2,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBtnActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: colors.textTertiary,
    fontFamily: fonts.body,
    letterSpacing: 0.5,
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.15)',
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    flex: 1,
    fontSize: 8,
    fontWeight: '700',
    color: '#EF4444',
    fontFamily: fonts.mono,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.accentCoralSoft,
    borderWidth: 1,
    borderColor: colors.accentCoral,
    borderRadius: 12,
    padding: 10,
    marginBottom: 14,
  },
  successText: {
    flex: 1,
    fontSize: 9,
    fontWeight: '600',
    color: colors.accentCoral,
    fontFamily: fonts.body,
  },
  form: {
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: fonts.body,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: 14,
    backgroundColor: colors.accentCoral,
    shadowColor: colors.accentCoral,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
    marginTop: 6,
  },
  submitText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
    fontFamily: fonts.body,
    letterSpacing: 0.5,
  },
});
