import React, { useState } from 'react';
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
  Alert,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { db } from '../database';
import { processImage, resolveApiUrl } from '../processing';
import { StashItem } from '../types';
import { colors, fonts } from '../theme/colors';
import { MultiStepLoader } from './MultiStepLoader';

const loadingStates = [
  { text: 'Reading your screenshot' },
  { text: 'Finding links and details' },
  { text: 'Extracting text and highlights' },
  { text: 'Analyzing what is inside' },
  { text: 'Naming and summarizing' },
  { text: 'Choosing the best category' },
  { text: 'Saving safely to your stash' }
];


interface AddStashModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: (item: StashItem) => void;
}

export function AddStashModal({
  visible,
  onClose,
  onSuccess,
}: AddStashModalProps) {
  const [mode, setMode] = useState<'url' | 'image'>('image');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);
  const [pipelineStep, setPipelineStep] = useState<number | null>(null);

  const executePipeline = async (
    type: 'link' | 'image',
    source: {
      url?: string;
      imageUri?: string;
      title?: string;
      desc?: string;
    },
  ) => {
    setLoading(true);
    setError(null);
    setPipelineStep(0);

    await new Promise(r => setTimeout(r, 450));
    setPipelineStep(1);

    const tempItem = await db.add({
      type,
      title: type === 'link'
        ? (source.url || 'Web Node').replace(/^https?:\/\//i, '').split('/')[0]
        : source.title || 'Screen Capture',
      description: type === 'link'
        ? 'Fetching metadata...'
        : 'Processing image...',
      imageUrl: source.imageUri,
      sourceUrl: source.url,
      status: 'processing',
      category: type === 'link' ? 'Articles' : 'Design',
    });

    onSuccess(tempItem);

    try {
      await new Promise(r => setTimeout(r, 300));
      setPipelineStep(2);
      let finalTitle = tempItem.title;
      let finalDesc = tempItem.description || '';
      let finalImg = tempItem.imageUrl || '';
      let finalSource = tempItem.sourceUrl || '';
      let finalFavicon = '';
      let finalOcr = '';
      let finalCategory = '';

      if (type === 'link') {
        setPipelineStep(3);
        let resolvedUrl = source.url || '';
        if (!/^https?:\/\//i.test(resolvedUrl)) {
          resolvedUrl = 'https://' + resolvedUrl;
        }
        const apiUrl = await resolveApiUrl();
        try {
          const res = await fetch(`${apiUrl}/api/metadata?url=${encodeURIComponent(resolvedUrl)}`);
          if (res.ok) {
            const data = await res.json();
            setPipelineStep(4);
            finalTitle = data.title || 'Web Note';
            finalDesc = data.description || '';
            finalImg = data.imageUrl || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
            finalSource = data.sourceUrl || resolvedUrl;
            
            let domain = 'stashed-node.net';
            try { domain = new URL(finalSource).hostname; } catch {}
            finalFavicon = data.favicon || `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
          } else {
            throw new Error('API fetch failed');
          }
        } catch (e) {
          let domain = 'stashed-node.net';
          try { domain = new URL(resolvedUrl).hostname; } catch {}
          setPipelineStep(4);
          finalTitle = domain.replace('www.', '').split('.')[0].toUpperCase() + ' Link Note';
          finalDesc = `Ingested from ${domain} (Offline Fallback)`;
          finalImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
          finalSource = resolvedUrl;
          finalFavicon = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
        }
      } else if (source.imageUri) {
        setPipelineStep(3);
        const result = await processImage(source.imageUri, source.title);
        setPipelineStep(4);
        finalTitle = result.title;
        finalDesc = result.description || result.summary;
        finalOcr = result.extractedText;
        finalImg = source.imageUri;
        finalCategory = result.category;
      }

      await new Promise(r => setTimeout(r, 300));
      setPipelineStep(5);
      const category = finalCategory && finalCategory.trim()
        ? finalCategory.trim()
        : autoCategorize(finalOcr || finalDesc || '', finalTitle, finalSource);

      setPipelineStep(6);
      const readyItem = await db.update(tempItem.id, {
        title: finalTitle,
        description: finalDesc,
        imageUrl: finalImg,
        sourceUrl: finalSource,
        favicon: finalFavicon,
        category,
        extractedText: finalOcr || `Imported from ${finalSource || 'gallery'}`,
        status: 'ready',
      });

      await new Promise(r => setTimeout(r, 400));
      if (readyItem) onSuccess(readyItem);
      setUrl('');
      setSelectedImage(null);
      setPipelineStep(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Processing failed.');
      try { await db.delete(tempItem.id); } catch {}
      onSuccess({} as any);
    } finally {
      setLoading(false);
      setPipelineStep(null);
    }
  };

  const handleLinkSubmit = () => {
    if (!url.trim()) return;
    executePipeline('link', { url: url.trim() });
  };

  const saveImagePermanently = async (tempUri: string): Promise<string> => {
    try {
      const persistentDir = `${FileSystem.documentDirectory}stash_images/`;
      const dirInfo = await FileSystem.getInfoAsync(persistentDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(persistentDir, { intermediates: true });
      }
      const fileName = `stash_${Date.now()}_${Math.floor(Math.random() * 10000)}.png`;
      const persistentUri = persistentDir + fileName;
      await FileSystem.copyAsync({
        from: tempUri,
        to: persistentUri,
      });
      return persistentUri;
    } catch (err) {
      console.warn('[AddStashModal] Failed to save image permanently, using temp URI:', err);
      return tempUri;
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.4,
        base64: false,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const a = result.assets[0];
        setLoading(true);
        const persistentUri = await saveImagePermanently(a.uri);
        setLoading(false);
        setSelectedImage({ uri: persistentUri, name: a.fileName || 'capture.png', size: a.fileSize });
      }
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Image picker failed', e?.message || 'Unknown error');
    }
  };

  const handleImageSubmit = () => {
    if (!selectedImage) return;
    executePipeline('image', {
      imageUri: selectedImage.uri,
      title: selectedImage.name?.split('.')[0] || 'Scanned Screenshot',
    });
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Animated.View
          entering={FadeIn.duration(250)}
          exiting={FadeOut.duration(200)}
          style={StyleSheet.absoluteFill}
        >
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View
          entering={SlideInDown.springify().damping(35).stiffness(320).mass(0.5)}
          exiting={SlideOutDown.springify().damping(35).stiffness(350).mass(0.5)}
          style={styles.sheet}
        >
          <View style={styles.sheetPanel}>
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>Add to Stash</Text>
                <Text style={styles.sub}>
                  Import a link or screenshot into your vault
                </Text>
              </View>
              <Pressable
                onPress={onClose}
                style={({ pressed }) => [
                  styles.closeBtn,
                  pressed && { opacity: 0.7 },
                ]}
              >
                <Feather name="x" color={colors.textSecondary} size={16} />
              </Pressable>
            </View>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setMode('image')}
                style={({ pressed }) => [
                  styles.modeTab,
                  mode === 'image' && styles.modeTabActive,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Feather
                  name="image"
                  color={mode === 'image' ? '#000000' : colors.textSecondary}
                  size={14}
                />
                <Text style={[styles.modeText, mode === 'image' && styles.modeTextActive]}>
                  Screenshot
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('url')}
                style={({ pressed }) => [
                  styles.modeTab,
                  mode === 'url' && styles.modeTabActive,
                  pressed && { transform: [{ scale: 0.98 }] },
                ]}
              >
                <Feather
                  name="link-2"
                  color={mode === 'url' ? '#000000' : colors.textSecondary}
                  size={14}
                />
                <Text style={[styles.modeText, mode === 'url' && styles.modeTextActive]}>
                  Web Link
                </Text>
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              {mode === 'url' ? (
                <View style={{ gap: 14 }}>
                  <View style={styles.inputRow}>
                    <TextInput
                      value={url}
                      onChangeText={setUrl}
                      placeholder="bonappetit.com/recipe"
                      placeholderTextColor={colors.textTertiary}
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
                        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                      ]}
                    >
                      <Feather name="search" color="#000000" size={16} />
                    </Pressable>
                  </View>
                </View>
              ) : (
                <View style={{ gap: 14 }}>
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
                          resizeMode="cover"
                        />
                        <View style={styles.previewMeta}>
                          <Feather name="check-circle" color={colors.accentCoral} size={12} />
                          <Text style={styles.previewMetaText}>
                            {selectedImage.name || 'Image selected'}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.dropEmpty}>
                        <View style={styles.dropIconBox}>
                          <Feather name="upload" color={colors.textSecondary} size={20} />
                        </View>
                        <Text style={styles.dropTitle}>Choose a screenshot</Text>
                        <Text style={styles.dropSub}>
                          Cloud OCR will extract text automatically
                        </Text>
                      </View>
                    )}
                  </Pressable>

                  {selectedImage && (
                    <Pressable
                      onPress={handleImageSubmit}
                      style={({ pressed }) => [
                        styles.primaryBtn,
                        pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
                      ]}
                    >
                      <Text style={styles.primaryBtnText}>Process image</Text>
                    </Pressable>
                  )}
                </View>
              )}

              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </Animated.View>

        <MultiStepLoader
          loadingStates={loadingStates}
          loading={loading}
          value={pipelineStep !== null ? pipelineStep : 0}
        />
      </View>
    </Modal>
  );
}

function autoCategorize(
  text: string,
  title: string,
  url?: string,
): string {
  const combined = `${text} ${title} ${url || ''}`.toLowerCase();

  const dict: Record<string, string[]> = {
    Shopping: ['buy','price','shop','sneaker','shoe','dress','watch','sale','amazon','etsy'],
    Recipes: ['cook','ingredient','food','recipe','bake','kitchen','eat','restaurant','brunch'],
    Travel: ['trip','flight','travel','hotel','mountain','vacation','beach','booking','airbnb'],
    Articles: ['read','blog','news','medium','article','theory','essay','newsletter'],
    Design: ['design','gradient','ui','ux','art','portfolio','3d','creative','aesthetic','furniture','interior'],
  };

  let best = 'Design';
  let max = 0;
  for (const [cat, keywords] of Object.entries(dict)) {
    const weight = keywords.reduce((sum, kw) => sum + (combined.includes(kw) ? 1 : 0), 0);
    if (weight > max) { max = weight; best = cat; }
  }
  return best;
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.overlayDim,
    justifyContent: 'flex-end',
  },
  sheet: {
    height: '70%',
    width: '100%',
  },
  sheetPanel: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 1,
    shadowRadius: 32,
    elevation: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 11,
    fontFamily: fonts.body,
    marginTop: 4,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 14,
    padding: 4,
    marginHorizontal: 22,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modeText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  modeTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  scroll: {
    padding: 22,
    gap: 14,
  },
  errorBox: {
    padding: 10,
    backgroundColor: colors.accentCoralSoft,
    borderWidth: 1,
    borderColor: colors.accentCoral,
    borderRadius: 10,
  },
  errorText: {
    color: colors.accentCoral,
    fontSize: 10.5,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  loadingBox: {
    alignItems: 'center',
    paddingVertical: 50,
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontWeight: '600',
  },
  loadingSub: {
    fontSize: 9,
    color: colors.textSecondary,
    fontFamily: fonts.body,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 16,
    paddingLeft: 14,
    paddingRight: 6,
    height: 54,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 14,
    fontFamily: fonts.body,
    paddingVertical: 12,
  },
  submitBtn: {
    height: 42,
    width: 42,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    borderRadius: 20,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropzoneActive: {
    borderColor: colors.accentCoral,
    borderStyle: 'solid',
    backgroundColor: colors.accentCoralSoft,
  },
  dropEmpty: {
    alignItems: 'center',
    gap: 8,
  },
  dropIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dropTitle: {
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: fonts.body,
    fontWeight: '700',
  },
  dropSub: {
    color: colors.textSecondary,
    fontSize: 9.5,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  previewWrap: {
    alignItems: 'center',
    gap: 10,
  },
  previewImg: {
    width: 120,
    height: 120,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  previewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  previewMetaText: {
    color: colors.accentCoral,
    fontSize: 9.5,
    fontFamily: fonts.body,
    fontWeight: '600',
  },
  primaryBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
