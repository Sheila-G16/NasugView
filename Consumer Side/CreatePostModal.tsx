// sections/CreatePostModal.tsx

import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Image,
    Modal,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
  username: string;
}

const CreatePostModal: React.FC<Props> = ({ visible, onClose, onUploadSuccess, username }) => {
  const [caption, setCaption] = useState('');
  const [image, setImage] = useState<any>(null);
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
    }
  };

  const uploadPost = async () => {
    if (!image) return;
    setUploading(true);

    const formData = new FormData();
    formData.append('username', username);
    formData.append('caption', caption);
    formData.append('image', {
      uri: image.uri,
      name: image.fileName || 'post.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const res = await fetch('http://localhost/BackendAct/upload_post.php', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const json = await res.json();
      if (json.success) {
        setCaption('');
        setImage(null);
        onUploadSuccess();
        onClose();
      } else {
        alert(json.message || 'Upload failed');
      }
    } catch (error) {
      alert('Error uploading post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black bg-opacity-50">
        <View className="bg-white p-4 rounded-t-2xl">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-lg font-bold">Create Post</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={pickImage}
            className="h-40 bg-gray-200 justify-center items-center rounded-xl mb-3"
          >
            {image ? (
              <Image source={{ uri: image.uri }} className="w-full h-full rounded-xl" resizeMode="cover" />
            ) : (
              <Ionicons name="image" size={40} color="#888" />
            )}
          </TouchableOpacity>

          <TextInput
            value={caption}
            onChangeText={setCaption}
            placeholder="Write a caption..."
            className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            multiline
          />

          <TouchableOpacity
            onPress={uploadPost}
            disabled={uploading}
            className="bg-blue-600 rounded-lg p-3"
          >
            {uploading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-center font-bold">Post</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default CreatePostModal;
