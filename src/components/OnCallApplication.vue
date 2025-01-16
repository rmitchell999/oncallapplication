<template>
  <div>
    <div class="tabs">
      <button @click="activeTab = 'schedule'">Weekly View</button>
      <button @click="activeTab = 'monthly'">Monthly View</button>
      <button @click="activeTab = 'contacts'">On-Call Contact List</button>
    </div>

    <div v-if="activeTab === 'schedule'">
      <h1>Terneuzen On-Call - Weekly</h1>
      <label for="start-time">Start Time/End Time:</label>
      <select id="start-time" v-model="startTime">
        <option v-for="time in timeOptions" :key="time">{{ time }}</option>
      </select>
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

    <div v-if="activeTab === 'monthly'" class="calendar">
      <h1>Terneuzen On-Call - Monthly</h1>
      <div v-for="(day, index) in daysInMonth" :key="index" class="calendar-day">
        <div>{{ day.date }}</div>
        <select v-model="day.contact" @change="saveMonthlySchedule">
          <option v-for="contact in contacts" :key="contact.name" :value="contact.name">
            {{ contact.name }}
          </option>
        </select>
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

const activeTab = ref('monthly');
const showModal = ref(false);
const editIndex = ref<number | null>(null);
const form = ref({ email: '', phone: '', name: '', onCall: false });
const errorMessage = ref('');

const contacts = ref([
  { email: 'jeffrey@example.com', phone: '+31627296098', name: 'Jeffrey van de...', onCall: true },
  { email: 'scott@example.com', phone: '+447785294418', name: 'Scott Beaton', onCall: false },
]);

const onCallList = ref([
  { groupName: 'Terneuzen', day: 'Monday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Tuesday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Wednesday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Thursday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Friday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Saturday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Sunday', contact: '', phone: '' },
]);

const daysInMonth = ref(Array.from({ length: 31 }, (_, i) => ({ date: i + 1, contact: '' })));

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

const frequencyOptions = ref(['Weekly']);
const selectedFrequency = ref('Weekly');

const timezoneOptions = ref(['GMT', 'EST', 'PST', 'CET']);
const selectedTimezone = ref('GMT');

const startTime = ref('');

const updatePhoneNumber = (index: number) => {
  const selectedContact = contacts.value.find(contact => contact.name === onCallList.value[index].contact);
  if (selectedContact) {
    onCallList.value[index].phone = selectedContact.phone;
  }
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

const saveContacts = () => {
  localStorage.setItem('contacts', JSON.stringify(contacts.value));
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
  saveContacts();
};

const deleteContact = (index: number) => {
  contacts.value.splice(index, 1);
  saveContacts();
};

const saveSchedule = () => {
  const confirmation = confirm('You are about to change the on-call schedule. Please confirm or cancel.');
  if (!confirmation) {
    return;
  }
  
  const schedule = {
    frequency: selectedFrequency.value,
    timezone: selectedTimezone.value,
    startTime: startTime.value,
    onCallList: onCallList.value,
  };
  localStorage.setItem('schedule', JSON.stringify(schedule));
  console.log('Schedule saved:', schedule);
};

const saveMonthlySchedule = () => {
  localStorage.setItem('monthlySchedule', JSON.stringify(daysInMonth.value));
};

const cancelChanges = () => {
  console.log('Changes cancelled');
};

onMounted(() => {
  const savedContacts = localStorage.getItem('contacts');
  if (savedContacts) {
    contacts.value = JSON.parse(savedContacts);
  }

  const savedSchedule = localStorage.getItem('schedule');
  if (savedSchedule) {
    const parsedSchedule = JSON.parse(savedSchedule);
    selectedFrequency.value = parsedSchedule.frequency;
    selectedTimezone.value = parsedSchedule.timezone;
    startTime.value = parsedSchedule.startTime;
    onCallList.value = parsedSchedule.onCallList;
  }

  const savedMonthlySchedule = localStorage.getItem('monthlySchedule');
  if (savedMonthlySchedule) {
    daysInMonth.value = JSON.parse(savedMonthlySchedule);
  }
});