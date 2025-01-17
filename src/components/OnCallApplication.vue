<template src="./OnCallApplication.html"></template>
<script setup lang="ts">
import '@/assets/main.css';
import { ref, onMounted, watch } from 'vue';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, addDays } from 'date-fns';

// Define an interface for the on-call entry
interface OnCallEntry {
  groupName: string;
  day: string;
  contact: string;
  phone: string;
}

const activeTab = ref('schedule');
const showModal = ref(false);
const editIndex = ref<number | null>(null);
const form = ref({ email: '', phone: '', name: '', onCall: false });
const errorMessage = ref('');
const contacts = ref([
  { email: 'jeffrey@example.com', phone: '+31627296098', name: 'Jeffrey van de...', onCall: true },
  { email: 'scott@example.com', phone: '+447785294418', name: 'Scott Beaton', onCall: false },
]);
const onCallList = ref<OnCallEntry[]>([]);
const timeOptions = ref(generateTimeOptions());
const frequencyOptions = ref(['Weekly', 'Monthly']);
const selectedFrequency = ref('Monthly');
const timezoneOptions = ref(['GMT', 'EST', 'PST', 'CET']);
const selectedTimezone = ref('GMT');
const startTime = ref('');

function generateTimeOptions() {
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i < 10 ? `0${i}` : i;
      const minute = j < 10 ? `0${j}` : j;
      times.push(`${hour}:${minute}`);
    }
  }
  return times;
}

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

const generateMonthlyCalendar = () => {
  const now = new Date();
  const start = startOfMonth(now);
  const end = endOfMonth(now);
  const days = eachDayOfInterval({ start, end });
  onCallList.value = days.map(day => ({
    groupName: 'Terneuzen',
    day: format(day, 'yyyy-MM-dd'),
    contact: '',
    phone: ''
  }));
};

const generateWeeklyCalendar = () => {
  const now = new Date();
  const start = startOfWeek(now, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  onCallList.value = days.map(day => ({
    groupName: 'Terneuzen',
    day: format(day, 'yyyy-MM-dd'),
    contact: '',
    phone: ''
  }));
};

const saveSchedule = () => {
  const confirmation = confirm('Are you sure you want to save these changes?');
  if (!confirmation) return;

  const schedule = {
    frequency: selectedFrequency.value,
    timezone: selectedTimezone.value,
    startTime: startTime.value,
    onCallList: onCallList.value,
  };
  localStorage.setItem('schedule', JSON.stringify(schedule));
  console.log('Schedule saved:', schedule);
};

const loadSchedule = () => {
  const savedSchedule = localStorage.getItem('schedule');
  if (savedSchedule) {
    const schedule = JSON.parse(savedSchedule);
    selectedFrequency.value = schedule.frequency;
    selectedTimezone.value = schedule.timezone;
    startTime.value = schedule.startTime;
    onCallList.value = schedule.onCallList.map((entry: OnCallEntry) => ({
      ...entry,
      contact: entry.contact || '',
      phone: entry.phone || '',
    }));
  } else {
    if (selectedFrequency.value === 'Monthly') {
      generateMonthlyCalendar();
    } else {
      generateWeeklyCalendar();
    }
  }
};

onMounted(() => {
  const savedContacts = localStorage.getItem('contacts');
  if (savedContacts) {
    contacts.value = JSON.parse(savedContacts);
  }
  loadSchedule();
});

watch(selectedFrequency, (newFrequency: string) => {
  if (newFrequency === 'Monthly') {
    generateMonthlyCalendar();
  } else {
    generateWeeklyCalendar();
  }
});
</script>
<style src="./OnCallApplication.css" scoped></style>