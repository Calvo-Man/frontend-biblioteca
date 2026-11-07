
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Administra los estudiantes registrados en la biblioteca.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus-outline"
        @click="openCreateDialog"
      >
        Nuevo estudiante
      </v-btn>
    </div>

    <!-- Búsqueda -->
    <v-card rounded="lg" elevation="0" border class="mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="6">
            <v-text-field
              v-model="search"
              label="Buscar estudiante"
              placeholder="Nombre, documento o usuario..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="handleSearch"
            />
          </v-col>

          <v-col cols="12" md="6" class="d-flex justify-md-end">
            <div class="text-body-2 text-medium-emphasis">
              Total de estudiantes:
              <strong>{{ total }}</strong>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card rounded="lg" elevation="0" border>
      <v-data-table
        :headers="headers"
        :items="students"
        :loading="loading"
        :items-per-page="limit"
        item-value="id"
        hide-default-footer
        no-data-text="No hay estudiantes registrados"
        loading-text="Cargando estudiantes..."
      >
        <template #item.full_name="{ item }">
          <div class="d-flex align-center ga-3 py-1">
            <v-avatar color="primary" variant="tonal" size="38">
              <span class="font-weight-bold">
                {{ getInitials(item.full_name) }}
              </span>
            </v-avatar>

            <div>
              <div class="font-weight-medium">
                {{ item.full_name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ item.username }}
              </div>
            </div>
          </div>
        </template>

        <template #item.document_number="{ item }">
          {{ item.document_number }}
        </template>

        <template #item.grade="{ item }">
          {{ item.grade }} - {{ item.group_name }}
        </template>

        <template #item.email="{ item }">
          <span class="text-medium-emphasis">
            {{ item.email || 'Sin correo' }}
          </span>
        </template>

        <template #item.is_active="{ item }">
          <v-chip
            :color="item.is_active ? 'success' : 'grey'"
            size="small"
            variant="tonal"
          >
            {{ item.is_active ? 'Activo' : 'Inactivo' }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <div class="d-flex justify-end ga-1">
            <v-tooltip text="Editar">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil-outline"
                  size="small"
                  variant="text"
                  color="primary"
                  @click="openEditDialog(item)"
                />
              </template>
            </v-tooltip>

            <v-tooltip :text="item.is_active ? 'Desactivar' : 'Activar'">
              <template #activator="{ props }">
                <v-btn
                  v-bind="props"
                  :icon="item.is_active ? 'mdi-account-off-outline' : 'mdi-account-check-outline'"
                  size="small"
                  variant="text"
                  :color="item.is_active ? 'error' : 'success'"
                  :loading="changingStatusId === item.id"
                  @click="toggleStatus(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>

        <template #bottom />
      </v-data-table>

      <!-- Paginación -->
      <v-divider />

      <div class="d-flex align-center justify-space-between flex-wrap ga-3 pa-4">
        <div class="text-body-2 text-medium-emphasis">
          Mostrando {{ students.length }} de {{ total }} estudiantes
        </div>

        <div class="d-flex align-center ga-3">
          <v-select
            v-model="limit"
            :items="[5, 10, 20, 50]"
            label="Por página"
            variant="outlined"
            density="compact"
            hide-details
            style="max-width: 125px"
            @update:model-value="changeLimit"
          />

          <v-pagination
            v-model="page"
            :length="totalPages"
            :total-visible="5"
            density="comfortable"
            @update:model-value="loadStudents"
          />
        </div>
      </div>
    </v-card>

    <!-- Modal crear / editar -->
    <v-dialog
      v-model="dialog"
      max-width="650"
      persistent
      scrollable
    >
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">
          {{ editingStudent ? 'Editar estudiante' : 'Registrar estudiante' }}
        </v-card-title>

        <v-card-text class="px-5 pt-3">
          <v-form ref="formRef" @submit.prevent="saveStudent">
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="form.full_name"
                  label="Nombre completo"
                  placeholder="Nombre y apellidos"
                  variant="outlined"
                  :rules="requiredRules"
                  maxlength="120"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.document_number"
                  label="Número de documento"
                  variant="outlined"
                  :rules="requiredRules"
                  maxlength="20"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.email"
                  label="Correo electrónico"
                  placeholder="estudiante@correo.com"
                  variant="outlined"
                  type="email"
                  :rules="emailRules"
                  maxlength="120"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.grade"
                  label="Grado"
                  placeholder="Ej. 10"
                  variant="outlined"
                  :rules="requiredRules"
                  maxlength="50"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.group_name"
                  label="Grupo"
                  placeholder="Ej. A"
                  variant="outlined"
                  :rules="requiredRules"
                  maxlength="20"
                />
              </v-col>

              <v-col cols="12">
                <v-divider class="mb-4" />
                <div class="text-subtitle-2 font-weight-bold mb-3">
                  Datos de acceso
                </div>
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-model="form.username"
                  label="Nombre de usuario"
                  variant="outlined"
                  :rules="usernameRules"
                  maxlength="50"
                  autocomplete="off"
                />
              </v-col>

              <v-col cols="12" md="6">
                <v-text-field
                  v-if="!editingStudent"
                  v-model="form.password"
                  label="Contraseña"
                  variant="outlined"
                  :type="showPassword ? 'text' : 'password'"
                  :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
                  :rules="passwordRules"
                  autocomplete="new-password"
                  @click:append-inner="showPassword = !showPassword"
                />

                <v-text-field
                  v-else
                  model-value="No se modifica desde aquí"
                  label="Contraseña"
                  variant="outlined"
                  readonly
                  disabled
                  hide-details
                />
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-card-actions class="pa-5 pt-0">
          <v-spacer />

          <v-btn
            variant="text"
            color="grey-darken-1"
            :disabled="saving"
            @click="closeDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            color="primary"
            :loading="saving"
            @click="saveStudent"
          >
            {{ editingStudent ? 'Guardar cambios' : 'Registrar estudiante' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Notificaciones -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      timeout="3500"
      location="bottom end"
    >
      {{ snackbar.message }}
    </v-snackbar>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { studentsService } from '../../services/students';

const students = ref([]);
const loading = ref(false);
const saving = ref(false);
const changingStatusId = ref(null);

const search = ref('');
const page = ref(1);
const limit = ref(10);
const total = ref(0);
const totalPages = ref(1);

const dialog = ref(false);
const formRef = ref(null);
const editingStudent = ref(null);
const showPassword = ref(false);

const form = reactive({
  full_name: '',
  document_number: '',
  username: '',
  password: '',
  grade: '',
  group_name: '',
  email: '',
});

const snackbar = reactive({
  show: false,
  message: '',
  color: 'success',
});

let searchTimeout = null;

const headers = [
  { title: 'Estudiante', key: 'full_name', sortable: false },
  { title: 'Documento', key: 'document_number', sortable: false },
  { title: 'Grado / Grupo', key: 'grade', sortable: false },
  { title: 'Correo', key: 'email', sortable: false },
  { title: 'Estado', key: 'is_active', sortable: false },
  { title: 'Acciones', key: 'actions', sortable: false, align: 'end' },
];

const requiredRules = [
  value => !!value?.trim() || 'Este campo es obligatorio.',
];

const usernameRules = [
  ...requiredRules,
  value => value?.trim().length >= 4 || 'Mínimo 4 caracteres.',
  value => value?.trim().length <= 50 || 'Máximo 50 caracteres.',
];

const passwordRules = [
  ...requiredRules,
  value => value?.length >= 8 || 'La contraseña debe tener mínimo 8 caracteres.',
];

const emailRules = [
  ...requiredRules,
  value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '') || 'Ingresa un correo válido.',
];

function showMessage(message, color = 'success') {
  snackbar.message = message;
  snackbar.color = color;
  snackbar.show = true;
}

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;

  return Array.isArray(message)
    ? message.join(', ')
    : message || fallback;
}

function getInitials(name) {
  return (name || 'ES')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(part => part.charAt(0).toUpperCase())
    .join('');
}

async function loadStudents() {
  loading.value = true;

  try {
    const response = await studentsService.getAll({
      page: page.value,
      limit: limit.value,
      search: search.value?.trim() || undefined,
    });

    students.value = response.data || [];
    total.value = response.total || 0;
    totalPages.value = Math.max(1, response.totalPages || 1);
  } catch (error) {
    console.error('Error al cargar estudiantes:', error);

    students.value = [];

    showMessage(
      getErrorMessage(error, 'No se pudieron cargar los estudiantes.'),
      'error',
    );
  } finally {
    loading.value = false;
  }
}

function handleSearch() {
  clearTimeout(searchTimeout);

  searchTimeout = setTimeout(() => {
    page.value = 1;
    loadStudents();
  }, 350);
}

function changeLimit() {
  page.value = 1;
  loadStudents();
}

function resetForm() {
  form.full_name = '';
  form.document_number = '';
  form.username = '';
  form.password = '';
  form.grade = '';
  form.group_name = '';
  form.email = '';

  editingStudent.value = null;
  showPassword.value = false;
}

function openCreateDialog() {
  resetForm();
  dialog.value = true;
}

function openEditDialog(student) {
  resetForm();

  editingStudent.value = student;

  form.full_name = student.full_name || '';
  form.document_number = student.document_number || '';
  form.username = student.username || '';
  form.grade = student.grade || '';
  form.group_name = student.group_name || '';
  form.email = student.email || '';

  dialog.value = true;
}

function closeDialog() {
  if (saving.value) return;

  dialog.value = false;
  resetForm();
}

async function saveStudent() {
  const validation = await formRef.value?.validate();

  if (!validation?.valid) return;

  saving.value = true;

  const studentData = {
    full_name: form.full_name.trim(),
    document_number: form.document_number.trim(),
    username: form.username.trim(),
    grade: form.grade.trim(),
    group_name: form.group_name.trim(),
    email: form.email.trim(),
  };

  try {
    if (editingStudent.value) {
      await studentsService.update(
        editingStudent.value.id,
        studentData,
      );

      showMessage('Estudiante actualizado correctamente.');
    } else {
      await studentsService.create({
        ...studentData,
        password: form.password,
      });

      showMessage('Estudiante registrado correctamente.');
    }

    dialog.value = false;
    resetForm();

    await loadStudents();
  } catch (error) {
    console.error('Error al guardar estudiante:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo guardar el estudiante.'),
      'error',
    );
  } finally {
    saving.value = false;
  }
}

async function toggleStatus(student) {
  const action = student.is_active ? 'desactivar' : 'activar';

  const confirmed = window.confirm(
    `¿Estás seguro de que deseas ${action} a ${student.full_name}?`,
  );

  if (!confirmed) return;

  changingStatusId.value = student.id;

  try {
    await studentsService.toggleStatus(student.id);

    showMessage(
      `Estudiante ${student.is_active ? 'desactivado' : 'activado'} correctamente.`,
    );

    await loadStudents();
  } catch (error) {
    console.error('Error al cambiar estado:', error);

    showMessage(
      getErrorMessage(error, 'No se pudo cambiar el estado del estudiante.'),
      'error',
    );
  } finally {
    changingStatusId.value = null;
  }
}

onMounted(() => {
  loadStudents();
});
</script>
