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
import {
  Link2,
  Upload,
  X,
  CheckCircle2,
  Search,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { db } from '../database';
import { processImage } from '../processing';
import { StashItem } from '../types';
import { colors, fonts } from '../theme/colors';

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
  const [mode, setMode] = useState<'url' | 'image'>('url');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{
    uri: string;
    name: string;
    size?: number;
  } | null>(null);

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
      let finalTitle = tempItem.title;
      let finalDesc = tempItem.description || '';
      let finalImg = tempItem.imageUrl || '';
      let finalSource = tempItem.sourceUrl || '';
      let finalFavicon = '';
      let finalOcr = '';
      let finalCategory = '';

      if (type === 'link') {
        let resolvedUrl = source.url || '';
        if (!/^https?:\/\//i.test(resolvedUrl)) {
          resolvedUrl = 'https://' + resolvedUrl;
        }
        let domain = 'stashed-node.net';
        try {
          domain = new URL(resolvedUrl).hostname;
        } catch {}
        finalTitle = domain.replace('www.', '').split('.')[0].toUpperCase() + ' Link Note';
        finalDesc = `Ingested from ${domain}`;
        finalImg = 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600';
        finalSource = resolvedUrl;
        finalFavicon = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
      } else if (source.imageUri) {
        const result = await processImage(source.imageUri, source.title);
        finalTitle = result.title;
        finalDesc = result.summary || result.description;
        finalOcr = result.extractedText;
        finalImg = result.imageUrl || source.imageUri;
        finalCategory = result.category;
      }

      const category = finalCategory && ['Shopping', 'Recipes', 'Travel', 'Articles', 'Design'].includes(finalCategory)
        ? finalCategory
        : autoCategorize(finalOcr || finalDesc || '', finalTitle, finalSource);

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

      if (readyItem) onSuccess(readyItem);
      setUrl('');
      setSelectedImage(null);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Processing failed.');
      try { await db.delete(tempItem.id); } catch {}
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
        quality: 0.4,
        base64: false,
        allowsEditing: false,
      });
      if (!result.canceled && result.assets && result.assets[0]) {
        const a = result.assets[0];
        setSelectedImage({ uri: a.uri, name: a.fileName || 'capture.png', size: a.fileSize });
      }
    } catch (e: any) {
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
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(22).stiffness(220)}
          exiting={SlideOutDown.duration(180)}
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
                <X color={colors.textSecondary} size={16} />
              </Pressable>
            </View>

            <View style={styles.modeRow}>
              <Pressable
                onPress={() => setMode('url')}
                style={[styles.modeTab, mode === 'url' && styles.modeTabActive]}
              >
                <Link2
                  color={mode === 'url' ? colors.bg : colors.textSecondary}
                  size={12}
                  strokeWidth={2}
                />
                <Text style={[styles.modeText, mode === 'url' && styles.modeTextActive]}>
                  Link
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setMode('image')}
                style={[styles.modeTab, mode === 'image' && styles.modeTabActive]}
              >
                <ImageIcon
                  color={mode === 'image' ? colors.bg : colors.textSecondary}
                  size={12}
                  strokeWidth={2}
                />
                <Text style={[styles.modeText, mode === 'image' && styles.modeTextActive]}>
                  Image
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

              {loading ? (
                <Animated.View
                  entering={FadeIn.duration(200)}
                  style={styles.loadingBox}
                >
                  <ActivityIndicator color={colors.textPrimary} size={24} />
                  <Text style={styles.loadingText}>Indexing into your vault...</Text>
                  <Text style={styles.loadingSub}>Local processing — stays on device</Text>
                </Animated.View>
              ) : mode === 'url' ? (
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
                        pressed && { opacity: 0.85 },
                      ]}
                    >
                      <Search color={colors.bg} size={14} strokeWidth={2.4} />
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
                          <CheckCircle2 color={colors.accentCoral} size={12} strokeWidth={2.4} />
                          <Text style={styles.previewMetaText}>
                            {selectedImage.name || 'Image selected'}
                          </Text>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.dropEmpty}>
                        <View style={styles.dropIconBox}>
                          <Upload color={colors.textSecondary} size={20} strokeWidth={1.8} />
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
                        pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
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
    backgroundColor: colors.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    shadowColor: colors.shadowMed,
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 12,
    backgroundColor: colors.bg,
  },
  title: {
    color: colors.textPrimary,
    fontFamily: fonts.display,
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  sub: {
    color: colors.textSecondary,
    fontSize: 10,
    fontFamily: fonts.body,
    marginTop: 4,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modeTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: colors.glassBg,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  modeTabActive: {
    backgroundColor: colors.textPrimary,
    borderColor: colors.textPrimary,
  },
  modeText: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  modeTextActive: {
    color: colors.bg,
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
    backgroundColor: colors.glassBgStrong,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: 14,
    paddingLeft: 14,
    paddingRight: 6,
    shadowColor: colors.shadowGlass,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 1,
  },
  textInput: {
    flex: 1,
    color: colors.textPrimary,
    fontSize: 12,
    fontFamily: fonts.body,
    paddingVertical: 12,
  },
  submitBtn: {
    padding: 9,
    backgroundColor: colors.textPrimary,
    borderRadius: 10,
  },
  dropzone: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.glassBorder,
    backgroundColor: colors.glassBgStrong,
    borderRadius: 16,
    padding: 22,
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
    backgroundColor: colors.textPrimary,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: colors.bg,
    fontSize: 11,
    fontFamily: fonts.body,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
