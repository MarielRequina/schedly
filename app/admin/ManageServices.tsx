import { Ionicons } from "@expo/vector-icons";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
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
import { database } from "../../constants/firebaseConfig";
import { Service } from "../../constants/servicesData";

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");

  // Load services from Firestore on component mount
  useEffect(() => {
    loadServicesFromFirestore();
  }, []);

  // 📥 Load services from Firestore
  const loadServicesFromFirestore = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(database, "services"));
      const firestoreServices: Service[] = [];
      
      querySnapshot.forEach((doc: { id: any; data: () => Service; }) => {
        const { id, ...data } = doc.data();
        firestoreServices.push({
          id: doc.id,
          ...data,
        } as Service);
      });
      
      setServices(firestoreServices);
    } catch (error) {
      console.error("Error loading services from Firestore:", error);
      Alert.alert("Error", "Failed to load services from database");
    } finally {
      setLoading(false);
    }
  };

  // ➕ Add new service to Firestore
  const handleAddService = async () => {
    if (!name || !price || !imageUrl) {
      Alert.alert("Error", "Please fill in all required fields (Name, Price, Image URL)");
      return;
    }

    try {
      setLoading(true);
      
      // Generate a custom ID based on timestamp and random string
      const customId = `service_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Use setDoc with custom ID instead of addDoc
      const { setDoc } = await import("firebase/firestore");
      await setDoc(doc(database, "services", customId), {
        id: customId,
        name,
        price,
        description,
        image: { uri: imageUrl },
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Service added successfully to database!");
      
      await loadServicesFromFirestore();
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error("Error adding service to Firestore:", error);
      Alert.alert("Error", "Failed to add service to database");
    } finally {
      setLoading(false);
    }
  };

  // ✏️ Edit service in Firestore
  const handleEditService = async () => {
    if (!currentService || !name || !price || !imageUrl) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      
      const serviceRef = doc(database, "services", currentService.id);
      await updateDoc(serviceRef, {
        name,
        price,
        description,
        image: { uri: imageUrl },
        updatedAt: new Date().toISOString(),
      });

      Alert.alert("Success", "Service updated successfully in database!");
      
      await loadServicesFromFirestore();
      resetForm();
      setModalVisible(false);
    } catch (error) {
      console.error("Error updating service in Firestore:", error);
      Alert.alert("Error", "Failed to update service in database");
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Delete service from Firestore
  const handleDeleteService = (id: string) => {
    console.log("Attempting to delete service with ID:", id);
    
    Alert.alert(
      "Delete Service",
      "Are you sure you want to delete this service? It will be removed from the database.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              console.log("Starting delete operation for ID:", id);
              
              // Delete from Firestore using the service ID
              const serviceRef = doc(database, "services", id);
              console.log("Service reference created:", serviceRef.path);
              
              await deleteDoc(serviceRef);
              console.log("Delete operation completed successfully");
              
              Alert.alert("Success", "Service deleted successfully from database!");
              await loadServicesFromFirestore();
            } catch (error) {
              console.error("Error deleting service from Firestore:", error);
              console.error("Error details:", JSON.stringify(error, null, 2));
              Alert.alert(
                "Error", 
                `Failed to delete service: ${error instanceof Error ? error.message : 'Unknown error'}\n\nCheck console for details.`
              );
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const resetForm = () => {
    setName("");
    setPrice("");
    setImageUrl("");
    setDescription("");
    setCurrentService(null);
    setEditMode(false);
  };

  const openEditModal = (service: Service) => {
    setCurrentService(service);
    setName(service.name);
    setPrice(service.price);
    setImageUrl(service.image.uri);
    setDescription(service.description || "");
    setEditMode(true);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Loading Indicator */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B5CF6" />
            <Text style={styles.loadingText}>Processing...</Text>
          </View>
        </View>
      )}

      {/* Enhanced Header with Gradient Effect */}
      <View style={styles.headerWrapper}>
        <View style={styles.headerContainer}>
          <View>
            <Text style={styles.header}>Manage Services</Text>
            <View style={styles.counterBadge}>
              <Ionicons name="sparkles" size={14} color="#8B5CF6" />
              <Text style={styles.subHeader}>
                {services.length} service{services.length !== 1 ? 's' : ''} available
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={26} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {services.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <View style={styles.iconGradient}>
                <Ionicons name="cut-outline" size={48} color="#8B5CF6" />
              </View>
            </View>
            <Text style={styles.emptyTitle}>No services yet</Text>
            <Text style={styles.emptySubtitle}>
              Create your first service to start managing your offerings
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => {
                resetForm();
                setModalVisible(true);
              }}
            >
              <Ionicons name="add-circle" size={22} color="#fff" />
              <Text style={styles.emptyButtonText}>Create Service</Text>
            </TouchableOpacity>
          </View>
        ) : (
          services.map((item) => (
            <View key={item.id} style={styles.card}>
              {/* Service Image with Overlay */}
              <View style={styles.imageContainer}>
                <Image 
                  source={item.image} 
                  style={styles.serviceImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay} />
              </View>

              {/* Service Info */}
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{item.name}</Text>
                
                <View style={styles.priceTag}>
                  <Ionicons name="pricetag" size={14} color="#8B5CF6" />
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
                  <Ionicons name="create-outline" size={20} color="#8B5CF6" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                <View style={styles.buttonDivider} />
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => handleDeleteService(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#DC2626" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Enhanced Modal */}
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
              <View>
                <Text style={styles.modalTitle}>
                  {editMode ? "Edit Service" : "New Service"}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {editMode ? "Update service details" : "Add a new service to your collection"}
                </Text>
              </View>
              <TouchableOpacity 
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView 
              showsVerticalScrollIndicator={false}
              style={styles.modalForm}
            >
              {/* Service Name */}
              <View style={styles.inputContainer}>
                <View style={styles.inputLabel}>
                  <View style={styles.labelIcon}>
                    <Ionicons name="cut" size={16} color="#8B5CF6" />
                  </View>
                  <Text style={styles.labelText}>Service Name</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
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
                  <View style={styles.labelIcon}>
                    <Ionicons name="pricetag" size={16} color="#8B5CF6" />
                  </View>
                  <Text style={styles.labelText}>Price</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
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
                  <View style={styles.labelIcon}>
                    <Ionicons name="image" size={16} color="#8B5CF6" />
                  </View>
                  <Text style={styles.labelText}>Image URL</Text>
                  <View style={styles.requiredBadge}>
                    <Text style={styles.requiredText}>Required</Text>
                  </View>
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
                  <View style={styles.labelIcon}>
                    <Ionicons name="document-text" size={16} color="#8B5CF6" />
                  </View>
                  <Text style={styles.labelText}>Description</Text>
                  <View style={styles.optionalBadge}>
                    <Text style={styles.optionalText}>Optional</Text>
                  </View>
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
                  name={editMode ? "checkmark-circle" : "add-circle"} 
                  size={20} 
                  color="#fff" 
                />
                <Text style={styles.saveButtonText}>
                  {editMode ? "Update Service" : "Add Service"}
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
  container: { 
    flex: 1, 
    backgroundColor: "#FAF5FF"
  },
  
  // Enhanced Header
  headerWrapper: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  header: { 
    fontSize: 32, 
    fontWeight: "800", 
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  counterBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  subHeader: { 
    fontSize: 13, 
    color: "#8B5CF6", 
    fontWeight: "600",
  },
  addButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8B5CF6",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyIconContainer: {
    marginBottom: 24,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#E9D5FF",
  },
  emptyTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySubtitle: { 
    fontSize: 15, 
    color: "#6B7280", 
    marginBottom: 32,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 32,
  },
  emptyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "#8B5CF6",
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  imageContainer: {
    width: "100%",
    height: 180,
    backgroundColor: "#F9FAFB",
    position: "relative",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: "rgba(139, 92, 246, 0.1)",
  },
  serviceInfo: {
    padding: 20,
  },
  serviceName: { 
    fontSize: 20, 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  priceTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    alignSelf: "flex-start",
    marginBottom: 10,
  },
  price: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#8B5CF6",
    letterSpacing: 0.2,
  },
  description: { 
    color: "#6B7280", 
    fontSize: 14, 
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#F3E8FF",
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  editButton: {
    backgroundColor: "#F9FAFB",
  },
  editButtonText: {
    color: "#8B5CF6",
    fontWeight: "700",
    fontSize: 15,
  },
  deleteButton: {
    backgroundColor: "#F9FAFB",
  },
  deleteButtonText: {
    color: "#DC2626",
    fontWeight: "700",
    fontSize: 15,
  },
  buttonDivider: {
    width: 1,
    backgroundColor: "#F3E8FF",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(139, 92, 246, 0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 24,
    paddingHorizontal: 24,
    paddingBottom: 32,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3E8FF",
  },
  modalTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: "#1F2937",
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
  },
  modalForm: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  labelIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  labelText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
    flex: 1,
  },
  requiredBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  requiredText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#DC2626",
  },
  optionalBadge: {
    backgroundColor: "#F3E8FF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  optionalText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#8B5CF6",
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    fontSize: 15,
    color: "#1F2937",
  },
  textArea: {
    height: 110,
    textAlignVertical: "top",
  },
  imagePreview: {
    marginTop: 14,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#E9D5FF",
  },
  previewImage: {
    width: "100%",
    height: 140,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 18,
    borderRadius: 16,
  },
  cancelButton: {
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  cancelButtonText: {
    color: "#4B5563",
    fontWeight: "700",
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 0.3,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "700",
    color: "#8B5CF6",
  },
});