import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import {
  Service,
  getServices,
  addService,
  updateService,
  deleteService,
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
      <View style={styles.headerRow}>
        <Text style={styles.header}>Manage Services</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            resetForm();
            setModalVisible(true);
          }}
        >
          <Ionicons name="add-circle" size={32} color="#6B46C1" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {services.length === 0 ? (
          <Text style={styles.emptyText}>No services yet. Add one to get started!</Text>
        ) : (
          services.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.serviceName}>{item.name}</Text>
                <Text style={styles.detail}>Price: {item.price}</Text>
                {item.description && (
                  <Text style={styles.description}>{item.description}</Text>
                )}
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#4299E1" }]}
                  onPress={() => openEditModal(item)}
                >
                  <Ionicons name="pencil-outline" size={20} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#E53E3E" }]}
                  onPress={() => handleDeleteService(item.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} />
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
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editMode ? "Edit Service" : "Add New Service"}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Service Name *"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />

            <TextInput
              style={styles.input}
              placeholder="Price (e.g., ₱250) *"
              placeholderTextColor="#999"
              value={price}
              onChangeText={setPrice}
            />

            <TextInput
              style={styles.input}
              placeholder="Image URL *"
              placeholderTextColor="#999"
              value={imageUrl}
              onChangeText={setImageUrl}
            />

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Description (optional)"
              placeholderTextColor="#999"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
            />

            <View style={styles.modalButtons}>
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
                <Text style={styles.saveButtonText}>
                  {editMode ? "Update" : "Add"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  header: { fontSize: 22, fontWeight: "700", color: "#6B46C1" },
  addButton: {
    padding: 5,
  },
  emptyText: {
    textAlign: "center",
    color: "#777",
    marginTop: 20,
    fontSize: 14,
  },
  card: {
    backgroundColor: "#F9F5FF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  serviceName: { fontSize: 17, fontWeight: "600", color: "#4A148C", marginBottom: 4 },
  detail: { color: "#555", fontSize: 13, marginTop: 2 },
  description: { color: "#777", fontSize: 12, marginTop: 4, fontStyle: "italic" },
  buttons: {
    flexDirection: "row",
    gap: 8,
  },
  button: {
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 25,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#6B46C1",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    fontSize: 14,
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#E2E8F0",
  },
  cancelButtonText: {
    color: "#4A5568",
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#6B46C1",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
