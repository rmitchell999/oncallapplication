<script setup lang="ts">
import '@/assets/main.css';
import { onMounted, ref } from 'vue';
import type { Schema } from '../../amplify/data/resource';
import { generateClient } from 'aws-amplify/data';

const client = generateClient<Schema>();

const onCallList = ref<Array<{ groupName: string; day: string; contact: string; phone: string }>>([]);
const contacts = ref<Array<{ name: string; phone: string }>>([
  { name: 'Jeffrey van de...', phone: '+31627296098' },
  { name: 'Scott Beaton', phone: '+447785294418' },
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

function listOnCallSchedule() {
  // Replace this with actual data fetching logic
  onCallList.value = [
    { groupName: 'Terneuzen', day: 'Monday', contact: 'Jeffrey van de...', phone: '+31627296098' },
    { groupName: 'Terneuzen', day: 'Tuesday', contact: 'Jeffrey van de...', phone: '+31627296098' },
    // Add more entries as needed
  ];
}

onMounted(() => {
  listOnCallSchedule();
});

</script>

<template>
  <main>
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
            <select v-model="entry.contact">
              <option v-for="contact in contacts" :key="contact.name" :value="contact.name">
                {{ contact.name }}
              </option>
            </select>
          </td>
          <td>{{ entry.phone }}</td>
        </tr>
      </tbody>
    </table>
  </main>
</template>

<style scoped>
.on-call-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  margin-bottom: 20px;
}

.time-selector {
  margin-bottom: 20px;
}

table {
  width: 100%;
  border-collapse: collapse;
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
</style>