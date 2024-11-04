import React, { useState } from 'react';
import { View, Text, TextInput, Button, Switch, ScrollView, StyleSheet, Modal, TouchableOpacity, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';

const HealthInputPage: React.FC = () => {
  const [BMI, setBmi] = useState<string>('');
  const [Smoking, setSmoking] = useState<boolean>(false);
  const [AlcoholDrinking, setAlcoholDrinking] = useState<boolean>(false);
  const [Stroke, setStroke] = useState<boolean>(false);
  const [PhysicalHealth, setPhysicalHealth] = useState<string>('');
  const [MentalHealth, setMentalHealth] = useState<string>('');
  const [DiffWalking, setDiffWalking] = useState<boolean>(false);
  const [AgeCategory, setAgeCategory] = useState<string>('18-24');
  const [Race, setRace] = useState<string>('White');
  const [Diabetic, setDiabetic] = useState<string>('No');
  const [PhysicalActivity, setPhysicalActivity] = useState<boolean>(false);
  const [GenHealth, setGenHealth] = useState<string>('Good');
  const [SleepTime, setSleepTime] = useState<string>('');
  const [Asthma, setAsthma] = useState<boolean>(false);
  const [KidneyDisease, setKidneyDisease] = useState<boolean>(false);
  const [SkinCancer, setSkinCancer] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [atRisk, setAtRisk] = useState(false);
  const [Risk, setRisk] = useState(0);
  const handleSubmit = async () => {
    const parsedBMI = parseFloat(BMI);
  const parsedPhysicalHealth = parseFloat(PhysicalHealth);
  const parsedMentalHealth = parseFloat(MentalHealth);
  const parsedSleepTime = parseFloat(SleepTime);


  if (
    isNaN(parsedBMI) || parsedBMI < 0 ||
    isNaN(parsedPhysicalHealth) || parsedPhysicalHealth < 0 ||
    isNaN(parsedMentalHealth) || parsedMentalHealth < 0 ||
    isNaN(parsedSleepTime) || parsedSleepTime < 0
  ) {
    Toast.show({
      type: 'error',
      text1: 'Text Input Error',
      text2: 'Please input valid numbers for the textboxes.',
    });
    return; 
  }

  const inputData = {
    HeartDisease: "No",
    BMI: parsedBMI,
    Smoking: Smoking ? "Yes" : "No",
    AlcoholDrinking: AlcoholDrinking ? "Yes" : "No",
    Stroke: Stroke ? "Yes" : "No",
    PhysicalHealth: parsedPhysicalHealth,
    MentalHealth: parsedMentalHealth,
    DiffWalking: DiffWalking ? "Yes" : "No",
    Sex: "Female",
    AgeCategory,
    Race,
    Diabetic,
    PhysicalActivity: PhysicalActivity ? "Yes" : "No",
    GenHealth,
    SleepTime: parsedSleepTime,
    Asthma: Asthma ? "Yes" : "No",
    KidneyDisease: KidneyDisease ? "Yes" : "No",
    SkinCancer: SkinCancer ? "Yes" : "No",
  };

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(inputData),
      });
      
      const result = await response.json();
      const prediction = result.predictions;
      setRisk(prediction);
      setAtRisk(prediction > 0.5);
      setModalVisible(true);
    } catch (error) {
      console.error('Error submitting data:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} stickyHeaderIndices={[0]}>
      <View style={styles.toastContainer} >
      <Toast />
      </View >
      <Text style={styles.header}>Health and Lifestyle Information</Text>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Health Metrics</Text>
        <Text style={styles.label}>BMI:</Text>
        <TextInput
          value={BMI}
          onChangeText={setBmi}
          keyboardType="numeric"
          placeholder="Enter BMI"
          style={styles.input}
        />

        <Text style={styles.label}>Physical Health (Days):</Text>
        <TextInput
          value={PhysicalHealth}
          onChangeText={setPhysicalHealth}
          keyboardType="numeric"
          placeholder="Enter days of poor physical health"
          style={styles.input}
        />

        <Text style={styles.label}>Mental Health (Days):</Text>
        <TextInput
          value={MentalHealth}
          onChangeText={setMentalHealth}
          keyboardType="numeric"
          placeholder="Enter days of poor mental health"
          style={styles.input}
        />

        <Text style={styles.label}>Sleep Time (Hours):</Text>
        <TextInput
          value={SleepTime}
          onChangeText={setSleepTime}
          keyboardType="numeric"
          placeholder="Enter sleep time in hours"
          style={styles.input}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Lifestyle Choices</Text>
        <Text style={styles.label}>Smoking:</Text>
        <Switch value={Smoking} onValueChange={setSmoking} />

        <Text style={styles.label}>Alcohol Drinking:</Text>
        <Switch value={AlcoholDrinking} onValueChange={setAlcoholDrinking} />

        <Text style={styles.label}>Physical Activity:</Text>
        <Switch value={PhysicalActivity} onValueChange={setPhysicalActivity} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Medical History</Text>
        <Text style={styles.label}>Stroke:</Text>
        <Switch value={Stroke} onValueChange={setStroke} />

        <Text style={styles.label}>Difficulty Walking:</Text>
        <Switch value={DiffWalking} onValueChange={setDiffWalking} />

        <Text style={styles.label}>Asthma:</Text>
        <Switch value={Asthma} onValueChange={setAsthma} />

        <Text style={styles.label}>Kidney Disease:</Text>
        <Switch value={KidneyDisease} onValueChange={setKidneyDisease} />

        <Text style={styles.label}>Skin Cancer:</Text>
        <Switch value={SkinCancer} onValueChange={setSkinCancer} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionHeader}>Demographics</Text>

        <Text style={styles.label}>Age Category:</Text>
        <Picker selectedValue={AgeCategory} onValueChange={(itemValue: string) => setAgeCategory(itemValue)} style={styles.picker}>
          <Picker.Item label="18-24" value="18-24" />
          <Picker.Item label="25-29" value="25-29" />
          <Picker.Item label="30-34" value="30-34" />
          <Picker.Item label="35-39" value="35-39" />
          <Picker.Item label="40-44" value="40-44" />
          <Picker.Item label="45-49" value="45-49" />
          <Picker.Item label="50-54" value="50-54" />
          <Picker.Item label="55-59" value="55-59" />
          <Picker.Item label="60-64" value="60-64" />
          <Picker.Item label="65-69" value="65-69" />
          <Picker.Item label="70-74" value="70-74" />
          <Picker.Item label="75-79" value="75-79" />
          <Picker.Item label="80 or older" value="80 or older" />
        </Picker>

        <Text style={styles.label}>Race:</Text>
        <Picker selectedValue={Race} onValueChange={(itemValue: string) => setRace(itemValue)} style={styles.picker}>
          <Picker.Item label="White" value="White" />
          <Picker.Item label="Black" value="Black" />
          <Picker.Item label="Asian" value="Asian" />
          <Picker.Item label="Hispanic" value="Hispanic" />
          <Picker.Item label="American Indian/Alaskan Native" value="American Indian/Alaskan Native" />
          <Picker.Item label="Other" value="Other" />
        </Picker>

        <Text style={styles.label}>Diabetic:</Text>
        <Picker selectedValue={Diabetic} onValueChange={(itemValue: string) => setDiabetic(itemValue)} style={styles.picker}>
          <Picker.Item label="No" value="No" />
          <Picker.Item label="Yes" value="Yes" />
          <Picker.Item label="No, borderline diabetes" value="No" />
          <Picker.Item label="Yes (during pregnancy)" value="Yes" />
        </Picker>

        <Text style={styles.label}>General Health:</Text>
        <Picker selectedValue={GenHealth} onValueChange={(itemValue: string)  => setGenHealth(itemValue)} style={styles.picker}>
          <Picker.Item label="Excellent" value="Excellent" />
          <Picker.Item label="Very good" value="Very good" />
          <Picker.Item label="Good" value="Good" />
          <Picker.Item label="Fair" value="Fair" />
          <Picker.Item label="Poor" value="Poor" />
        </Picker>
      </View>

      <Button title="Submit" onPress={handleSubmit} color="#4CAF50" />


      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>Heart Disease Risk</Text>
            <Text style={styles.modalText}>
              {atRisk ? 'You are at risk of heart disease. Please consult a healthcare provider.' : 'You are not at risk of heart disease.'}
            </Text>
            <Text style={styles.modalText}>
              {'We calculated a ' + (Risk * 100).toFixed(2) + '% chance of heart disease.'}
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
    color: '#333',
  },

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  section: {
    backgroundColor: '#ffffff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
  },
  label: {
    fontSize: 16,
    color: '#666',
    marginVertical: 5,
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    marginBottom: 10,
    padding: 8,
  },
  picker: {
    marginBottom: 10,
  },
  toastContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1, 
  },
});

export default HealthInputPage;
