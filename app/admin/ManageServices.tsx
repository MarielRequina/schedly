import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  Service,
  addService,
  deleteService,
  getServices,
  updateService,
} from "../../constants/servicesData";

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>(getServices());
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  const refreshServices = () => {
    setServices(getServices());
    setRefreshKey(prev => prev + 1);
  };

  // ➕ Add new service
  const handleAddService = () => {
    if (!name || !price || !imageUrl) {
      Alert.alert("Error", "Please fill in all required fields (Name, Price, Image URL)");
      return;
    }

    try {
      addService({
        name,
        price,
        description,
        image: { uri: imageUrl },
      });
      Alert.alert("Success", "Service added successfully! Changes will appear in User Services.");
      refreshServices();
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to add service");
    }
  };

  // ✏️ Edit service
  const handleEditService = () => {
    if (!currentService || !name || !price || !imageUrl) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      updateService(currentService.id, {
        name,
        price,
        description,
        image: { uri: imageUrl },
      });
      Alert.alert("Success", "Service updated successfully! Changes will appear in User Services.");
      refreshServices();
      resetForm();
      setModalVisible(false);
    } catch (error) {
      Alert.alert("Error", "Failed to update service");
    }
  };

  // 🗑️ Delete service
  const handleDeleteService = (id: string) => {
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service? It will be removed from User Services.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            try {
              deleteService(id);
              Alert.alert("Success", "Service deleted successfully!");
              refreshServices();
            } catch (error) {
              Alert.alert("Error", "Failed to delete service");
            }
          },
        },
      ]
    );
  };

  // 🔄 Reset form
  const resetForm = () => {
    setName("");
    setPrice("");
    setImageUrl("");
    setDescription("");
    setCurrentService(null);
    setEditMode(false);
  };

  // 📝 Open edit modal
  const openEditModal = (service: Service) => {
    setCurrentService(service);
    setName(service.name);
    setPrice(service.price);
    setImageUrl(service.image.uri);
    setDescription(service.description || "");
    setEditMode(true);
    setModalVisible(true);
  };

  // 🖼️ UI
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Manage Services</Text>
          <Text style={styles.subHeader}>{services.length} service{services.length !== 1 ? 's' : ''} available</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="cut-outline" size={60} color="#E0A100" />
            </View>
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtitle}>Add your first service to get started</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.emptyButtonText}>Add Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* Service Image */}
              <View style={styles.imageContainer}>
                <Image 
                  source={item.image} 
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
              </View>

              {/* Service Info */}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                
                <View style={styles.priceContainer}>
                  <Ionicons name="pricetag" size={16} color="#E0A100" />
                  <Text style={styles.price}>{item.price}</Text>
                </View>
                
                {item.description && (
                  <Text style={styles.description} numberOfLines={2}>
                    {item.description}
                  </Text>
                )}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil" size={18} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteService(item.id)}
                >
                  <Ionicons name="trash" size={18} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal for Add/Edit Service */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          resetForm();
          setModalVisible(false);
        }}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.modalOverlay}
        >
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editMode ? "Edit Service" : "Add New Service"}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Service Name */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="cut" size={16} color="#E0A100" />
                  <Text style={styles.labelText}>Service Name *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Premium Haircut"
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>

              {/* Price */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="pricetag" size={16} color="#E0A100" />
                  <Text style={styles.labelText}>Price *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., ₱250"
                  placeholderTextColor="#9CA3AF"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="default"
                />
              </View>

              {/* Image URL */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="image" size={16} color="#E0A100" />
                  <Text style={styles.labelText}>Image URL *</Text>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#9CA3AF"
                  value={imageUrl}
                  onChangeText={setImageUrl}
                  autoCapitalize="none"
                />
                {imageUrl && (
                  <View style={styles.imagePreview}>
                    <Image 
                      source={{ uri: imageUrl }} 
                      style={styles.previewImage}
                      resizeMode="cover"
                    />
                  </View>
                )}
              </View>

              {/* Description */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <Ionicons name="document-text" size={16} color="#E0A100" />
                  <Text style={styles.labelText}>Description (Optional)</Text>
                </View>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Brief description of the service..."
                  placeholderTextColor="#9CA3AF"
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
              </View>
            </ScrollView>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={editMode ? handleEditService : handleAddService}
              >
                <Ionicons 
                  name={editMode ? "checkmark" : "add"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.saveButtonText}>
                  {editMode ? "Update" : "Add Service"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7E6" },
  
  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
  },
  header: { fontSize: 28, fontWeight: "700", color: "#1F2937" },
  subHeader: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#E0A100",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Scroll Content
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  // Empty State
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyTitle: { 
    fontSize: 22, 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: 8 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: "#6B7280", 
    marginBottom: 24,
    textAlign: "center",
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#E0A100",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  // Service Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  imageContainer: {
    width: "100%",
    height: 160,
    backgroundColor: "#F3F4F6",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  serviceInfo: {
    padding: 16,
  },
  serviceName: { 
    fontSize: 18, 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: 8 
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  price: { 
    fontSize: 16, 
    fontWeight: "600", 
    color: "#E0A100" 
  },
  description: { 
    color: "#6B7280", 
    fontSize: 13, 
    lineHeight: 18 
  },

  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionButton: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  editButton: {
    backgroundColor: "#3B82F6",
    borderBottomLeftRadius: 16,
  },
  deleteButton: {
    backgroundColor: "#EF4444",
    borderBottomRightRadius: 16,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },

  // Input Fields
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  labelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },

  // Image Preview
  imagePreview: {
    marginTop: 12,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
  },
  previewImage: {
    width: "100%",
    height: 120,
  },

  // Modal Actions
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
  },
  cancelButton: {
    backgroundColor: "#F3F4F6",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: "#E0A100",
    shadowColor: "#E0A100",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});