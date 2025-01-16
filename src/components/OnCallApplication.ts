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

/**
 * Opens the modal for adding or editing a contact.
 * If an index is provided, it loads the contact data into the form for editing.
 * Otherwise, it initializes the form with empty values for adding a new contact.
 * 
 * @param event - The mouse event that triggered the modal opening.
 * @param index - The index of the contact to edit, or null to add a new contact.
 */
const openModal = (event: MouseEvent, index: number | null = null) => {
  event.preventDefault();
  if (index !== null) {
    // Load the contact data into the form for editing
    form.value = { ...contacts.value[index] };
    editIndex.value = index;
  } else {
    // Initialize the form with empty values for adding a new contact
    form.value = { email: '', phone: '', name: '', onCall: false };
    editIndex.value = null;
  }
  // Show the modal
  showModal.value = true;
  // Clear any previous error messages
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