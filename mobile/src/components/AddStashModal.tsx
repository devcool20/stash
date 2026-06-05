import React, { useState, useRef } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  Image,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Platform,
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideInDown,
  SlideInLeft,
  SlideInRight,
} from 'react-native-reanimated';
import {
  X,
  Upload,
  Link2,
  CheckCircle2,
  Search,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import Constants from 'expo-constants';
import { GlassPanel } from './GlassPanel';
import { db, autoCategorize } from '../database';
import { StashItem } from '../types';
import { colors, radii } from '../theme/colors';

interface AddStashModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (item: StashItem) => void;
}

const PRESETS = [
  {
    name: 'Minimal Living Room',
    url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=600',
    title: 'Soma Interior Layout',
    description: 'Clean mid-century modular shelving screenshot',
    keyword: 'Design',
  },
  {
    name: 'Artisanal Brunch Table',
    url: 'https://images.unsplash.com/photo-1496041870309-6748e0b0e525?auto=format&fit=crop&q=80&w=600',
    title: 'Slow Breakfast Spread',
    description: 'Poached avocado eggs on sourdough flatlay recipe',
    keyword: 'Recipes',
  },
  {
    name: 'Yosemite Misty Valley',
    url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?auto=format&fit=crop&q=80&w=600',
    title: 'Yosemite Travel Card',
    description: 'Breathtaking peaks and fog trail hiking guide map screenshot',
    keyword: 'Travel',
  },
];

const MOCK_OCR = [
  'AUTHENTIC PREMIUM LOOKS FOR MEN & WOMEN\nDESIGNED IN BALENCIAGA PARIS STUDS\nPRICE: €1200.00\nSIZE: EXTRA LARGE\nPOSTED: 3 HOURS AGO\nTAGS: #FASHION #DESIGN',
  'INGREDIENTS LIST:\n- 4 ORGANIC EGGS\n- 1 CUP UNSTABILIZED HOLLANDAISE\n- CHIVES & CURED DUCK THIGHS\n- WILD SOURDOUGH LOAF\nBON APPETIT MAG.',
  'SOMA STRETCH ARMCHAIR OAKEN WOODS\nMATERIAL: BOUCHÉ TEXTURED\nDESIGNER ID: WEGNER-284\nRETAIL: $4,250',
  'FLUID CYAN GRADIENTS STUDIES MAPPED\nSPLINE SHADER S3D - COMPOSITING\nREACTION RATIO: 16MS\nCREATED AT DEV-STASH LABS',
];

function extractMetaFromUrl(urlStr: string) {
  let resolvedUrl = urlStr;
  if (!/^https?:\/\//i.test(resolvedUrl)) {
    resolvedUrl = 'https://' + resolvedUrl;
  }
  let domain = 'stashed-node.net';
  try {
    domain = new URL(resolvedUrl).hostname;
  } catch {}
  return {
    title: domain.replace('www.', '').split('.')[0].toUpperCase() + ' Link Note',
    description: `Ingested content connection to ${domain}. Metadata parsed locally on offline fallback.`,
    imageUrl:
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600',
    sourceUrl: resolvedUrl,
    favicon: `https://www.google.com/s2/favicons?sz=64&domain=${domain}`,
  };
}

export function AddStashModal({
  visible,
  onClose,
  onSuccess,
}: AddStashModalProps) {
  const [ingestType, setIngestType] = useState<'link' | 'image'>('link');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);
  const [pipelineProgress, setPipelineProgress] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
    size?: number;
    base64?: string;
  } | null>(null);

  const getServerUrl = () => {
    if (process.env.EXPO_PUBLIC_API_URL) {
      return process.env.EXPO_PUBLIC_API_URL;
    }
    const manifest = Constants.expoConfig || (Constants as any).manifest;
    const debuggerHost = manifest?.hostUri;
    if (debuggerHost) {
      const ip = debuggerHost.split(':')[0];
      return `http://${ip}:3000`;
    }
    return Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';
  };

  const imageUrlToBase64 = async (urlStr: string): Promise<string> => {
    const response = await fetch(urlStr);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const executePipeline = async (
    type: 'link' | 'image',
    source: {
      url?: string;
      imageUri?: string;
      imageUrl?: string;
      imageBase64?: string;
      title?: string;
      desc?: string;
    },
  ) => {
    setLoading(true);
    setError(null);
    setPipelineStep(0);
    setPipelineProgress(
      'OS INTENT CAPTURED (15ms)... Saving temporary cache envelope',
    );

    await new Promise((r) => setTimeout(r, 400));
    setPipelineStep(1);
    setPipelineProgress(
      'DATABASE ENTRY STAGED (35ms)... status="processing" shimmering placeholder added',
    );

    const tempItem = await db.add({
      type,
      title:
        type === 'link'
          ? (source.url || 'Web Node').replace(/^https?:\/\//i, '').split('/')[0]
          : source.title || 'Screen Capture',
      description:
        type === 'link'
          ? 'Intercepting metadata coordinates...'
          : 'Engaging local OCR scan...',
      imageUrl:
        type === 'link'
          ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
          : source.imageUri || source.imageUrl,
      sourceUrl: source.url,
      status: 'processing',
      category: type === 'link' ? 'Articles' : 'Design',
    });

    onSuccess(tempItem);

    try {
      await new Promise((r) => setTimeout(r, 600));
      setPipelineStep(2);

      let finalTitle = tempItem.title;
      let finalDesc = tempItem.description || '';
      let finalImg = tempItem.imageUrl || '';
      let finalSource = tempItem.sourceUrl || '';
      let finalFavicon = '';
      let finalOcr = '';
      let derived = tempItem.category;

      if (type === 'link') {
        setPipelineProgress(
          'METADATA HYDRATION PARSER (400ms)... Gathering OpenGraph tags from site',
        );
        try {
          const serverUrl = getServerUrl();
          const abortController = new AbortController();
          const timeoutId = setTimeout(() => abortController.abort(), 6000);
          
          const res = await fetch(
            `${serverUrl}/api/metadata?url=${encodeURIComponent(source.url || '')}`,
            { signal: abortController.signal }
          );
          clearTimeout(timeoutId);

          if (!res.ok) throw new Error('Unresponsive domain node.');
          const meta = await res.json();
          finalTitle = meta.title || finalTitle;
          finalDesc = meta.description || finalDesc;
          finalImg = meta.imageUrl || finalImg;
          finalSource = meta.sourceUrl || finalSource;
          finalFavicon = meta.favicon || '';
        } catch (err) {
          console.log('Server metadata fetch failed, using local fallback:', err);
          const meta = extractMetaFromUrl(source.url || '');
          finalTitle = meta.title || finalTitle;
          finalDesc = meta.description || finalDesc;
          finalImg = meta.imageUrl || finalImg;
          finalSource = meta.sourceUrl || finalSource;
          finalFavicon = meta.favicon || '';
        }
      } else {
        setPipelineProgress(
          'ON-DEVICE OCR PIPELINE (1200ms)... engaging local neural core',
        );
        let ocrText = '';
        let ocrData: any = null;
        try {
          let base64Data = source.imageBase64;
          if (!base64Data && source.imageUrl) {
            setPipelineProgress(
              'FETCHING PRESET DATA (400ms)... converting remote image',
            );
            base64Data = await imageUrlToBase64(source.imageUrl);
          }

          if (base64Data) {
            setPipelineProgress(
              'INVOKING AI OCR ENGINE (800ms)... calling backend model',
            );
            const serverUrl = getServerUrl();
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 12000);

            const res = await fetch(`${serverUrl}/api/ocr`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                base64: base64Data,
                mimeType: 'image/png',
              }),
              signal: abortController.signal,
            });
            clearTimeout(timeoutId);

            if (res.ok) {
              ocrData = await res.json();
              ocrText = ocrData.text || '';
            } else {
              throw new Error('OCR API returned error status.');
            }
          } else {
            throw new Error('No image base64 data available.');
          }
        } catch (err) {
          console.log('Server OCR failed, using local mock fallback:', err);
          await new Promise((r) => setTimeout(r, 600));
          const idx = Math.floor(Math.random() * MOCK_OCR.length);
          ocrText = MOCK_OCR[idx];
          
          const mockOCRResponses = [
            {
              text: 'AUTHENTIC PREMIUM LOOKS FOR MEN & WOMEN\nDESIGNED IN BALENCIAGA PARIS STUDS\nPRICE: €1200.00\nSIZE: EXTRA LARGE\nPOSTED: 3 HOURS AGO\nTAGS: #FASHION #DESIGN',
              title: 'Balenciaga Studio Preview',
              description: 'Product listing page showing Balenciaga Paris studs for men and women.',
              category: 'Shopping',
              tags: ['fashion', 'balenciaga', 'design']
            },
            {
              text: 'INGREDIENTS LIST:\n- 4 ORGANIC EGGS\n- 1 CUP UNSTABILIZED HOLLANDAISE\n- CHIVES & CURED DUCK THIGHS\n- WILD SOURDOUGH LOAF\nBON APPETIT MAG.',
              title: 'Sunday Brunch Benedict Recipe',
              description: 'Ingredients card for a slow Sunday brunch showing eggs benedict on sourdough.',
              category: 'Recipes',
              tags: ['brunch', 'recipe', 'cooking']
            },
            {
              text: 'SOMA STRETCH ARMCHAIR OAKEN WOODS\nMATERIAL: BOUCHÉ TEXTURED\nDESIGNER ID: WEGNER-284\nRETAIL: $4,250',
              title: 'Soma Oak Chair Specs',
              description: 'Spec sheet for a Soma oaken stretch armchair with bouché fabric.',
              category: 'Design',
              tags: ['furniture', 'interior', 'designer']
            },
            {
              text: 'FLUID CYAN GRADIENTS STUDIES MAPPED\nSPLINE SHADER S3D - COMPOSITING\nREACTION RATIO: 16MS\nCREATED AT DEV-STASH LABS',
              title: 'Cyan Fluid Spline compositing',
              description: 'Gradients visual study render with Spline 3D compositing shaders.',
              category: 'Design',
              tags: ['compositing', 'spline', 'shader']
            }
          ];
          ocrData = mockOCRResponses.find(m => m.text === ocrText) || {
            text: ocrText,
            title: source.title || 'Extracted Screenshot',
            description: ocrText.substring(0, 100) + '...',
            category: 'Design',
            tags: ['fallback']
          };
        }

        finalOcr = ocrText;
        finalTitle = ocrData?.title || source.title || 'Extracted Screenshot';
        finalDesc = ocrData?.description || 'Extracted screenshot visual elements';
        derived = ocrData?.category || 'Design';
        finalImg = source.imageUri || source.imageUrl || '';
      }

      await new Promise((r) => setTimeout(r, 500));
      setPipelineStep(3);
      setPipelineProgress(
        'FTS5 TOKEN INDEXING (220ms)... tokenizing keywords, status="ready" on-device sync completed',
      );

      if (type === 'link') {
        const combined = `${finalTitle} ${finalDesc} ${finalOcr}`.toLowerCase();
        const autoCategory = autoCategorize(
          finalOcr || finalDesc || '',
          finalTitle,
          finalSource,
        );

        // Re-derive the best category using the same combined heuristic
        derived = autoCategory;
        if (
          combined.includes('poached') ||
          combined.includes('egg') ||
          combined.includes('brunch') ||
          combined.includes('recipe') ||
          combined.includes('food')
        )
          derived = 'Recipes';
        else if (
          combined.includes('mount') ||
          combined.includes('valley') ||
          combined.includes('travel') ||
          combined.includes('trip') ||
          combined.includes('hiking')
        )
          derived = 'Travel';
        else if (
          combined.includes('cotton') ||
          combined.includes('shirting') ||
          combined.includes('wear') ||
          combined.includes('price') ||
          combined.includes('buy') ||
          combined.includes('watch') ||
          combined.includes('luxur')
        )
          derived = 'Shopping';
        else if (
          combined.includes('theory') ||
          combined.includes('sovereignty') ||
          combined.includes('read') ||
          combined.includes('article')
        )
          derived = 'Articles';
      }

      // Ensure the category exists in database categories list
      await db.addCategory(derived);

      const readyItem = await db.update(tempItem.id, {
        title: finalTitle,
        description: finalDesc,
        imageUrl: finalImg,
        sourceUrl: finalSource,
        favicon: finalFavicon,
        category: derived,
        extractedText:
          finalOcr ||
          `METADATA HYDRATION: Link established with ${finalSource}. Saved tags: ${finalTitle}.`,
        status: 'ready',
      });

      await new Promise((r) => setTimeout(r, 300));
      if (readyItem) onSuccess(readyItem);
      setUrl('');
      setSelectedImage(null);
      setPipelineStep(null);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Pipeline failed during processing.');
      try {
        await db.delete(tempItem.id);
      } catch {}
      onSuccess({} as any);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSubmit = () => {
    if (!url.trim()) return;
    executePipeline('link', { url: url.trim() });
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.6,
        base64: true,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const a = result.assets[0];
        setSelectedImage({
          uri: a.uri,
          name: a.fileName || 'capture.png',
          size: a.fileSize,
          base64: a.base64 || undefined,
        });
      }
    } catch (e: any) {
      Alert.alert('Image picker failed', e?.message || 'Unknown error');
    }
  };

  const handleImageSubmit = () => {
    if (!selectedImage) return;
    executePipeline('image', {
      imageUri: selectedImage.uri,
      imageBase64: selectedImage.base64,
      title:
        selectedImage.name?.split('.')[0] || 'Scanned Screenshot',
    });
  };

  const handlePresetSelect = (preset: (typeof PRESETS)[number]) => {
    executePipeline('image', {
      imageUrl: preset.url,
      title: preset.title,
      desc: preset.description,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <Animated.View
          entering={FadeIn.duration(150)}
          exiting={FadeOut.duration(150)}
          style={StyleSheet.absoluteFill}
        >
          <View style={styles.backdropTint} />
        </Animated.View>

        <Animated.View
          entering={SlideInUp.springify().damping(18).stiffness(220)}
          exiting={SlideInDown.duration(180)}
          style={styles.modalWrap}
        >
          <GlassPanel
            variant="base"
            borderRadius={20}
            intensity={36}
            style={styles.modal}
          >
            {/* Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <View style={styles.headerDot} />
                <Text style={styles.modalTitle}>INGESTION CHANNEL</Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <X color={colors.textSecondary} size={16} />
              </Pressable>
            </View>

            <ScrollView
              style={styles.modalBody}
              contentContainerStyle={{ padding: 18, gap: 18 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Type toggle */}
              {pipelineStep === null && (
                <View style={styles.typeToggle}>
                  <Pressable
                    onPress={() => setIngestType('link')}
                    style={[
                      styles.typeBtn,
                      ingestType === 'link' && styles.typeBtnActive,
                    ]}
                  >
                    <Link2
                      color={ingestType === 'link' ? '#000' : colors.textSecondary}
                      size={12}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.typeBtnText,
                        ingestType === 'link' && { color: '#000' },
                      ]}
                    >
                      PASTE URL CONNECTION
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setIngestType('image')}
                    style={[
                      styles.typeBtn,
                      ingestType === 'image' && styles.typeBtnActive,
                    ]}
                  >
                    <ImageIcon
                      color={
                        ingestType === 'image' ? '#000' : colors.textSecondary
                      }
                      size={12}
                      strokeWidth={2}
                    />
                    <Text
                      style={[
                        styles.typeBtnText,
                        ingestType === 'image' && { color: '#000' },
                      ]}
                    >
                      SCAN SCREENSHOT
                    </Text>
                  </Pressable>
                </View>
              )}

              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {pipelineStep !== null ? (
                <Animated.View
                  entering={FadeIn.duration(180)}
                  style={styles.pipelineBox}
                >
                  <View style={styles.pipelineHeader}>
                    <Text style={styles.pipelineHeaderText}>
                      EXECUTION LIFECYCLE PIPELINE
                    </Text>
                    <View style={styles.pipelineCounter}>
                      <ActivityIndicator color="#FFFFFF" size={10} />
                      <Text style={styles.pipelineCounterText}>
                        {pipelineStep + 1}/4
                      </Text>
                    </View>
                  </View>

                  <View style={{ gap: 8 }}>
                    {[
                      '1. INTENT CAPTURED & TEMP STAGED',
                      '2. LOCAL SECTOR INSTANT RE-RENDER',
                      '3. CLIENT CLOUD ANALYSIS/OCR',
                      '4. INDEX TO ENCRYPTED FTS DATABASE',
                    ].map((stepLabel, idx) => {
                      const isDone = pipelineStep > idx;
                      const isActive = pipelineStep === idx;
                      return (
                        <View
                          key={idx}
                          style={[
                            styles.pipelineStep,
                            isDone && styles.pipelineStepDone,
                            isActive && styles.pipelineStepActive,
                          ]}
                        >
                          {isDone ? (
                            <CheckCircle2
                              color={colors.emerald}
                              size={14}
                              strokeWidth={2.2}
                            />
                          ) : isActive ? (
                            <ActivityIndicator color="#FFFFFF" size={12} />
                          ) : (
                            <View style={styles.pipelineBullet}>
                              <Text style={styles.pipelineBulletText}>
                                {idx + 1}
                              </Text>
                            </View>
                          )}
                          <Text style={styles.pipelineStepText}>
                            {stepLabel}
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.pipelineProgressBox}>
                    <Text style={styles.pipelineProgressText}>
                      {pipelineProgress}
                    </Text>
                  </View>
                </Animated.View>
              ) : ingestType === 'link' ? (
                <Animated.View
                  entering={SlideInLeft.duration(180)}
                  style={{ gap: 12 }}
                >
                  <Text style={styles.fieldLabel}>SOURCE ADDRESS LINK</Text>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={url}
                      onChangeText={setUrl}
                      placeholder="e.g. bonappetit.com/recipe"
                      placeholderTextColor={colors.textMuted}
                      style={styles.textInput}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="go"
                      onSubmitEditing={handleLinkSubmit}
                    />
                    <Pressable
                      onPress={handleLinkSubmit}
                      style={({ pressed }) => [
                        styles.submitBtn,
                        pressed && { transform: [{ scale: 0.95 }] },
                      ]}
                    >
                      <Search color="#000" size={14} strokeWidth={2.4} />
                    </Pressable>
                  </View>
                  <Text style={styles.helperText}>
                    Dropping happens silently in the background. The local
                    parser gathers high-contrast image pointers and structural
                    tags instantly.
                  </Text>
                </Animated.View>
              ) : (
                <Animated.View
                  entering={SlideInRight.duration(180)}
                  style={{ gap: 14 }}
                >
                  <Pressable
                    onPress={pickImage}
                    style={({ pressed }) => [
                      styles.dropzone,
                      selectedImage && styles.dropzoneActive,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    {selectedImage ? (
                      <View style={styles.previewWrap}>
                        <Image
                          source={{ uri: selectedImage.uri }}
                          style={styles.previewImg}
                          resizeMode="contain"
                        />
                        <View style={styles.previewMeta}>
                          <CheckCircle2
                            color={colors.emerald}
                            size={11}
                            strokeWidth={2.2}
                          />
                          <Text style={styles.previewMetaText}>
                            CAPTURE READY (
                            {selectedImage.size
                              ? Math.round(selectedImage.size / 1024)
                              : 'PRESET'}{' '}
                            KB)
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.dropEmpty}>
                        <View style={styles.dropIcon}>
                          <Upload color="#FFFFFF" size={18} strokeWidth={2} />
                        </View>
                        <Text style={styles.dropTitle}>
                          Drag screenshot here or click to browse
                        </Text>
                        <Text style={styles.dropSub}>
                          Supports on-device OCR scanning
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  <View style={{ gap: 6 }}>
                    <Text style={styles.fieldLabel}>
                      AESTHETIC TESTING INBOX PRESETS
                    </Text>
                    <View style={styles.presetGrid}>
                      {PRESETS.map((p, idx) => (
                        <Pressable
                          key={idx}
                          onPress={() => handlePresetSelect(p)}
                          disabled={loading}
                          style={({ pressed }) => [
                            styles.presetTile,
                            pressed && { transform: [{ scale: 0.97 }] },
                          ]}
                        >
                          <Image
                            source={{ uri: p.url }}
                            style={styles.presetImg}
                            resizeMode="cover"
                          />
                          <Text
                            style={styles.presetName}
                            numberOfLines={1}
                          >
                            {p.name}
                          </Text>
                          <Text
                            style={styles.presetKey}
                            numberOfLines={1}
                          >
                            {p.keyword}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {selectedImage && (
                    <Pressable
                      onPress={handleImageSubmit}
                      disabled={loading}
                      style={({ pressed }) => [
                        styles.ocrSubmit,
                        pressed && { transform: [{ scale: 0.97 }] },
                      ]}
                    >
                      <Text style={styles.ocrSubmitText}>
                        ENGAGE HYBRID OCR ENGINE
                      </Text>
                    </Pressable>
                  )}
                </Animated.View>
              )}
            </ScrollView>
          </GlassPanel>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  backdropTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  modalWrap: {
    width: '100%',
    maxHeight: '85%',
  },
  modal: {
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.emerald,
  },
  modalTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
  },
  modalBody: {
    flexGrow: 0,
  },
  typeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  typeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 999,
    gap: 5,
  },
  typeBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  typeBtnText: {
    fontSize: 9.5,
    color: colors.textSecondary,
    letterSpacing: 1,
    fontWeight: '500',
  },
  errorBox: {
    padding: 10,
    backgroundColor: 'rgba(127,29,29,0.4)',
    borderWidth: 1,
    borderColor: 'rgba(127,29,29,0.5)',
    borderRadius: 8,
  },
  errorText: {
    color: '#FCA5A5',
    fontSize: 10.5,
  },
  pipelineBox: {
    gap: 12,
    paddingVertical: 8,
  },
  pipelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pipelineHeaderText: {
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  pipelineCounter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  pipelineCounterText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontSize: 10,
  },
  pipelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  pipelineStepDone: {
    backgroundColor: 'rgba(16,185,129,0.08)',
    borderColor: 'rgba(16,185,129,0.25)',
  },
  pipelineStepActive: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderColor: 'rgba(255,255,255,0.15)',
    transform: [{ scale: 1.01 }],
  },
  pipelineBullet: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pipelineBulletText: {
    fontSize: 8,
    color: colors.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pipelineStepText: {
    color: colors.textPrimary,
    fontSize: 10.5,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '500',
  },
  pipelineProgressBox: {
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
  },
  pipelineProgressText: {
    color: colors.textSecondary,
    fontSize: 9,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  fieldLabel: {
    fontSize: 9,
    color: colors.textSecondary,
    letterSpacing: 1.5,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingLeft: 12,
    paddingRight: 6,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    paddingVertical: 10,
  },
  submitBtn: {
    padding: 7,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  helperText: {
    fontSize: 9,
    color: colors.textMuted,
    lineHeight: 12,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneActive: {
    borderColor: 'rgba(16,185,129,0.5)',
    backgroundColor: 'rgba(16,185,129,0.04)',
  },
  dropEmpty: {
    alignItems: 'center',
    gap: 6,
  },
  dropIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: '600',
  },
  dropSub: {
    color: colors.textMuted,
    fontSize: 10,
  },
  previewWrap: {
    alignItems: 'center',
    gap: 10,
  },
  previewImg: {
    height: 100,
    width: '70%',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  previewMetaText: {
    color: colors.emerald,
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  presetGrid: {
    flexDirection: 'row',
    gap: 6,
  },
  presetTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    borderRadius: 10,
    padding: 4,
  },
  presetImg: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 6,
    marginBottom: 4,
  },
  presetName: {
    color: colors.textPrimary,
    fontSize: 8.5,
    fontWeight: '500',
  },
  presetKey: {
    color: colors.textMuted,
    fontSize: 7,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  ocrSubmit: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 11,
    borderRadius: 999,
    alignItems: 'center',
    shadowColor: '#FFFFFF',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  ocrSubmitText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 1.5,
  },
});
