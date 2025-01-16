<script setup lang="ts">
import '@/assets/main.css';
import { ref, onMounted } from 'vue';

// Example Schema import and client setup
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const activeTab = ref('schedule');

const contacts = ref<Array<{ email: string; phone: string; name: string; onCall: boolean }>>([
  { email: 'jeffrey@example.com', phone: '+31627296098', name: 'Jeffrey van de...', onCall: true },
  { email: 'scott@example.com', phone: '+447785294418', name: 'Scott Beaton', onCall: false },
]);

const onCallList = ref<Array<{ groupName: string; day: string; contact: string; phone: string }>>([
  { groupName: 'Terneuzen', day: 'Monday', contact: contacts.value[0].name, phone: contacts.value[0].phone },
  { groupName: 'Terneuzen', day: 'Tuesday', contact: contacts.value[0].name, phone: contacts.value[0].phone },
  // Add more entries as needed
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

const updatePhoneNumber = (index: number) => {
  const selectedContact = contacts.value.find(contact => contact.name === onCallList.value[index].contact);
  if (selectedContact) {
    onCallList.value[index].phone = selectedContact.phone;
  }
};

const addContact = () => {
  const name = prompt('Enter name');
  const email = prompt('Enter email');
  const phone = prompt('Enter phone number');
  if (name && email && phone) {
    contacts.value.push({ name, email, phone, onCall: false });
  }
};

const editContact = (index: number) => {
  const contact = contacts.value[index];
  const name = prompt('Edit name', contact.name);
  const email = prompt('Edit email', contact.email);
  const phone = prompt('Edit phone number', contact.phone);
  if (name && email && phone) {
    contacts.value[index] = { ...contact, name, email, phone };
  }
};

const deleteContact = (index: number) => {
  contacts.value.splice(index, 1);
};

onMounted(() => {
  // Example data fetching logic
  // listOnCallSchedule();
});

</script>

<template>
  <div class="on-call-application">
    <div class="tabs">
      <button @click="activeTab = 'schedule'">Terneuzen On-Call</button>
      <button @click="activeTab = 'contacts'">On-Call Contact List</button>
    </div>

    <div v-if="activeTab === 'schedule'">
      <h1>Terneuzen On-Call</h1>
      <div class="time-selector">
        <label for="time">On call Start/End Time</label>
        <select id="time">
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
    </div>

    <div v-if="activeTab === 'contacts'">
      <h1>On-Call Contact List</h1>
      <button @click="addContact">+ ADD</button>
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
              <button @click="editContact(index)">✏️</button>
              <button @click="deleteContact(index)">🗑️</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

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
</style>