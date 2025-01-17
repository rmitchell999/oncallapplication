<template src="./OnCallApplication.html"></template>
<script setup lang="ts">
import '@/assets/main.css';
import { ref, onMounted, watch } from 'vue';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, setMonth } from 'date-fns';

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
const contacts = ref(getInitialContacts());
const onCallList = ref<OnCallEntry[]>([]);
const timeOptions = ref(generateTimeOptions());
const timezoneOptions = ref(['GMT', 'EST', 'PST', 'CET']);
const selectedTimezone = ref('GMT');
const startTime = ref('');
const months = ref(getMonths());
const selectedMonth = ref(new Date().getMonth());

function getInitialContacts() {
  return [
    { email: 'jeffrey@example.com', phone: '+31627296098', name: 'Jeffrey van de...', onCall: true },
    { email: 'scott@example.com', phone: '+447785294418', name: 'Scott Beaton', onCall: false },
  ];
}

function getMonths() {
  return [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
}

function generateTimeOptions() {
  const times = [];
  for (let i = 0; i < 24; i++) {
    for (let j = 0; j < 60; j += 30) {
      const hour = i.toString().padStart(2, '0');
      const minute = j.toString().padStart(2, '0');
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
  if (!/^\+?[1-9]\d{1,14}$/.test(form.value.phone)) {
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

const generateCalendar = () => {
  const now = new Date();
  const start = startOfMonth(setMonth(now, selectedMonth.value));
  const end = endOfMonth(start);
  const days = eachDayOfInterval({ start, end });
  onCallList.value = days.map(day => ({
    groupName: 'Terneuzen',
    day: format(day, 'EEEE yyyy-MM-dd'),
    contact: '',
    phone: ''
  }));
  loadSchedule();
};

const saveSchedule = () => {
  if (!confirm('Are you sure you want to save these changes?')) return;

  const schedule = {
    month: selectedMonth.value,
    timezone: selectedTimezone.value,
    startTime: startTime.value,
    onCallList: onCallList.value,
  };
  localStorage.setItem('schedule', JSON.stringify(schedule));
};

const loadSchedule = () => {
  const savedSchedule = localStorage.getItem('schedule');
  if (savedSchedule) {
    const schedule = JSON.parse(savedSchedule);
    selectedMonth.value = schedule.month;
    selectedTimezone.value = schedule.timezone;
    startTime.value = schedule.startTime;

    onCallList.value.forEach(entry => {
      const savedEntry = schedule.onCallList.find((e: OnCallEntry) => e.day === entry.day);
      if (savedEntry) {
        entry.contact = savedEntry.contact;
        entry.phone = savedEntry.phone;
      }
    });
  }
};

onMounted(() => {
  const savedContacts = localStorage.getItem('contacts');
  if (savedContacts) {
    contacts.value = JSON.parse(savedContacts);
  }
  generateCalendar();
});

watch(selectedMonth, generateCalendar);
</script>