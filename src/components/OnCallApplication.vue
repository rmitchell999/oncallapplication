<template>
  <div class="on-call-application">
    <div class="tabs">
      <button @click="activeTab = 'schedule'">Terneuzen On-Call</button>
      <button @click="activeTab = 'contacts'">On-Call Contact List</button>
    </div>

    <div v-if="activeTab === 'schedule'">
      <h1>Terneuzen On-Call</h1>
      <div class="schedule-options">
        <label for="frequency">Frequency:</label>
        <select id="frequency" v-model="selectedFrequency">
          <option v-for="option in frequencyOptions" :key="option">{{ option }}</option>
        </select>

        <label for="timezone">Timezone:</label>
        <select id="timezone" v-model="selectedTimezone">
          <option v-for="option in timezoneOptions" :key="option">{{ option }}</option>
        </select>

        <label for="start-time">Start Time:</label>
        <select id="start-time" v-model="startTime">
          <option v-for="time in timeOptions" :key="time">{{ time }}</option>
        </select>

        <label for="end-time">End Time:</label>
        <select id="end-time" v-model="endTime">
          <option v-for="time in timeOptions" :key="time">{{ time }}</option>
        </select>
      </div>

      <table>
        <thead>
          <tr>
            <th>On-Call Group Name</th>
            <th>Day of Week</th>
            <th>On-Call Contact Selected</th>
            <th>Phone Number</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(entry, index) in onCallList" :key="index">
            <td>{{ entry.groupName }}</td>
            <td>{{ entry.day }}</td>
            <td>
              <select v-model="entry.contact" @change="updatePhoneNumber(index)">
                <option v-for="contact in contacts" :key="contact.name" :value="contact.name">
                  {{ contact.name }}
                </option>
              </select>
            </td>
            <td>{{ entry.phone }}</td>
          </tr>
        </tbody>
      </table>

      <div class="action-buttons">
        <button @click="saveSchedule">Save</button>
        <button @click="cancelChanges">Cancel</button>
      </div>
    </div>

    <div v-if="activeTab === 'contacts'">
      <h1>On-Call Contact List</h1>
      <button @click="(event) => openModal(event)">+ ADD</button>
      <table>
        <thead>
          <tr>
            <th>Email Address</th>
            <th>Phone Number</th>
            <th>Name</th>
            <th>Currently On-Call</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(contact, index) in contacts" :key="index">
            <td>{{ contact.email }}</td>
            <td>{{ contact.phone }}</td>
            <td>{{ contact.name }}</td>
            <td>{{ contact.onCall ? 'On Call' : 'Free' }}</td>
            <td>
              <button @click="(event) => openModal(event, index)">✏️</button>
              <button @click="deleteContact(index)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="showModal" class="modal">
      <div class="modal-content">
        <h2>{{ editIndex !== null ? 'Edit Contact' : 'Create New Contact' }}</h2>
        <form @submit.prevent="saveContact">
          <label>Email *</label>
          <input v-model="form.email" type="email" required />
          <label>Phone Number *</label>
          <input v-model="form.phone" required placeholder="+1234567890" />
          <label>Name *</label>
          <input v-model="form.name" required />
          <p style="color: red;">{{ errorMessage }}</p>
          <button type="submit">{{ editIndex !== null ? 'UPDATE CONTACT' : 'CREATE CONTACT' }}</button>
          <button type="button" @click="showModal = false">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import '@/assets/main.css';
import { ref, onMounted } from 'vue';

import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const activeTab = ref('schedule');
const showModal = ref(false);
const editIndex = ref<number | null>(null);
const form = ref({ email: '', phone: '', name: '', onCall: false });
const errorMessage = ref('');

const contacts = ref([
  { email: 'jeffrey@example.com', phone: '+31627296098', name: 'Jeffrey van de...', onCall: true },
  { email: 'scott@example.com', phone: '+447785294418', name: 'Scott Beaton', onCall: false },
]);

const onCallList = ref([
  { groupName: 'Terneuzen', day: 'Monday', contact: contacts.value[0].name, phone: contacts.value[0].phone },
  { groupName: 'Terneuzen', day: 'Tuesday', contact: contacts.value[0].name, phone: contacts.value[0].phone },
]);

const generateTimeOptions = () => {
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i < 10 ? `0${i}` : i;
      const minute = j < 10 ? `0${j}` : j;
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
};

const timeOptions = ref(generateTimeOptions());

const frequencyOptions = ref(['Weekly', 'Fortnightly', 'Monthly']);
const selectedFrequency = ref('Weekly');

const timezoneOptions = ref(['GMT', 'EST', 'PST', 'CET']);
const selectedTimezone = ref('GMT');

const startTime = ref('');
const endTime = ref('');

const updatePhoneNumber = (index: number) => {
  const selectedContact = contacts.value.find(contact => contact.name === onCallList.value[index].contact);
  if (selectedContact) {
    onCallList.value[index].phone = selectedContact.phone;
  }

  contacts.value.forEach(contact => {
    contact.onCall = contact.name === onCallList.value[index].contact;
  });
};

const openModal = (event: MouseEvent, index: number | null = null) => {
  event.preventDefault();
  if (index !== null) {
    form.value = { ...contacts.value[index] };
    editIndex.value = index;
  } else {
    form.value = { email: '', phone: '', name: '', onCall: false };
    editIndex.value = null;
  }
  showModal.value = true;
  errorMessage.value = '';
};

const saveContact = () => {
  const e164Regex = /^\+?[1-9]\d{1,14}$/;
  if (!e164Regex.test(form.value.phone)) {
    errorMessage.value = 'Please enter a valid E.164 phone number.';
    return;
  }

  if (editIndex.value !== null) {
    contacts.value[editIndex.value] = { ...form.value };
  } else {
    contacts.value.push({ ...form.value });
  }
  showModal.value = false;
};

const deleteContact = (index: number) => {
  contacts.value.splice(index, 1);
};

const saveSchedule = () => {
  console.log('Schedule saved:', {
    frequency: selectedFrequency.value,
    timezone: selectedTimezone.value,
    startTime: startTime.value,
    endTime: endTime.value,
  });
};

const cancelChanges = () => {
  console.log('Changes cancelled');
};

onMounted(() => {});
</script>

<style scoped>
.on-call-application {
  padding: 20px;
  font-family: Arial, sans-serif;
}

.tabs {
  margin-bottom: 20px;
}

.tabs button {
  margin-right: 10px;
  padding: 10px;
  cursor: pointer;
}

.schedule-options, .action-buttons {
  margin-top: 20px;
}

.schedule-options label, .action-buttons button {
  margin-right: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th, td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

select {
  padding: 5px;
  width: 100%;
}

button {
  cursor: pointer;
}

.modal {
  position: fixed;
  top: 0}