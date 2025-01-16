<template src="./OnCallApplication.html"></template>

<script setup lang="ts">
import '@/assets/main.css';
import { ref, onMounted } from 'vue';

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
  { groupName: 'Terneuzen', day: 'Monday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Tuesday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Wednesday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Thursday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Friday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Saturday', contact: '', phone: '' },
  { groupName: 'Terneuzen', day: 'Sunday', contact: '', phone: '' },
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

const cancelChanges = () => {
  console.log('Changes cancelled');
};

onMounted(() => {
  const savedSchedule = localStorage.getItem('schedule');
  if (savedSchedule) {
    const schedule = JSON.parse(savedSchedule);
    selectedFrequency.value = schedule.frequency;
    selectedTimezone.value = schedule.timezone;
    startTime.value = schedule.startTime;
    onCallList.value = schedule.onCallList;
  }
});
</script>

<style src="./OnCallApplication.css" scoped></style>