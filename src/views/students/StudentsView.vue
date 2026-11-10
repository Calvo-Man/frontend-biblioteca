
<template>
  <div class="page-container">
    <!-- Encabezado -->
    <div class="page-header d-flex align-center justify-space-between flex-wrap ga-3 mb-6">
      <div>
        <p class="text-body-2 text-medium-emphasis mt-1">
          Administra los estudiantes registrados en la biblioteca.
        </p>
      </div>

      <v-btn
        color="primary"
        prepend-icon="mdi-account-plus-outline"
        rounded="lg"
        @click="openCreateDialog"
      >
        Nuevo estudiante
      </v-btn>
    </div>

    <!-- Búsqueda -->
    <v-card rounded="lg" elevation="0" border class="filter-card mb-4">
      <v-card-text>
        <v-row align="center">
          <v-col cols="12" md="7">
            <v-text-field
              v-model="search"
              label="Buscar estudiante"
              placeholder="Nombre, documento, código o usuario..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="comfortable"
              hide-details
              clearable
              @update:model-value="handleSearch"
            />
          </v-col>

          <v-col cols="12" md="5" class="d-flex justify-md-end">
            <div class="text-body-2 text-medium-emphasis">
              Total de estudiantes:
              <strong class="text-high-emphasis">{{ total }}</strong>
            </div>
          </v-col>
        </v-row>
      </v-card-text>
    </v-card>

    <!-- Tabla -->
    <v-card rounded="lg" elevation="0" border class="table-card">
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
          <div class="d-flex align-center ga-3 py-2">
            <v-avatar color="primary" variant="tonal" size="40">
              <span class="font-weight-bold">
                {{ getInitials(item.full_name) }}
              </span>
            </v-avatar>

            <div>
              <div class="font-weight-medium">
                {{ item.full_name }}
              </div>
              <div class="text-caption text-medium-emphasis">
                @{{ item.username }}
              </div>
            </div>
          </div>
        </template>

        <template #item.student_code="{ item }">
          <span class="font-weight-medium">
            {{ item.student_code || 'Sin código' }}
          </span>
        </template>

        <template #item.document_number="{ item }">
          {{ item.document_number }}
        </template>

        <template #item.grade="{ item }">
          <v-chip size="small" variant="tonal" color="primary">
            {{ item.grade }} - {{ item.group_name }}
          </v-chip>
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
            <v-tooltip text="Editar estudiante">
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
                  :icon="item.is_active
                    ? 'mdi-account-off-outline'
                    : 'mdi-account-check-outline'"
                  size="small"
                  variant="text"
                  :color="item.is_active ? 'error' : 'success'"
                  :loading="changingStatusId === item.id"
                  @click="openStatusDialog(item)"
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

        <div class="d-flex align-center ga-3 flex-wrap">
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
      max-width="700"
      persistent
      scrollable
    >
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">
          <div class="d-flex align-center ga-2">
            <v-icon color="primary">
              {{ editingStudent ? 'mdi-account-edit-outline' : 'mdi-account-plus-outline' }}
            </v-icon>

            {{ editingStudent ? 'Editar estudiante' : 'Registrar estudiante' }}
          </div>
        </v-card-title>

        <v-card-text class="px-5 pt-3">
          <v-form ref="formRef" @submit.prevent="saveStudent">
            <div class="text-subtitle-2 font-weight-bold mb-3">
              Información personal
            </div>

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
                  v-model="form.student_code"
                  label="Código estudiantil"
                  placeholder="Código asignado por el colegio"
                  variant="outlined"
                  :rules="requiredRules"
                  maxlength="20"
                />
              </v-col>

              <v-col cols="12">
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
            </v-row>

            <v-divider class="my-3" />

            <div class="text-subtitle-2 font-weight-bold mb-3">
              Datos de acceso
            </div>

            <v-row>
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
            rounded="lg"
            :loading="saving"
            @click="saveStudent"
          >
            {{ editingStudent ? 'Guardar cambios' : 'Registrar estudiante' }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Confirmación de estado -->
    <v-dialog
      v-model="statusDialog"
      max-width="430"
      persistent
    >
      <v-card rounded="lg">
        <v-card-title class="pa-5 pb-2">
          <div class="d-flex align-center ga-2">
            <v-icon :color="studentToChange?.is_active ? 'error' : 'success'">
              {{ studentToChange?.is_active
                ? 'mdi-account-off-outline'
                : 'mdi-account-check-outline' }}
            </v-icon>

            {{ studentToChange?.is_active ? 'Desactivar estudiante' : 'Activar estudiante' }}
          </div>
        </v-card-title>

        <v-card-text class="px-5">
          <p class="text-body-2 text-medium-emphasis">
            ¿Estás seguro de que deseas
            <strong>
              {{ studentToChange?.is_active ? 'desactivar' : 'activar' }}
            </strong>
            a
            <strong>{{ studentToChange?.full_name }}</strong>?
          </p>
        </v-card-text>

        <v-card-actions class="pa-5 pt-0">
          <v-spacer />

          <v-btn
            variant="text"
            color="grey-darken-1"
            :disabled="changingStatusId !== null"
            @click="closeStatusDialog"
          >
            Cancelar
          </v-btn>

          <v-btn
            :color="studentToChange?.is_active ? 'error' : 'success'"
            rounded="lg"
            :loading="changingStatusId !== null"
            @click="confirmToggleStatus"
          >
            {{ studentToChange?.is_active ? 'Desactivar' : 'Activar' }}
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
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue';
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
const statusDialog = ref(false);

const formRef = ref(null);
const editingStudent = ref(null);
const studentToChange = ref(null);
const showPassword = ref(false);

const form = reactive({
  full_name: '',
  document_number: '',
  student_code: '',
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
  { title: 'Código', key: 'student_code', sortable: false },
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
  value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value || '')
    || 'Ingresa un correo válido.',
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

    if (page.value > totalPages.value) {
      page.value = totalPages.value;
      await loadStudents();
    }
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
  form.student_code = '';
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
  form.student_code = student.student_code || '';
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
    student_code: form.student_code.trim(),
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

function openStatusDialog(student) {
  studentToChange.value = student;
  statusDialog.value = true;
}

function closeStatusDialog() {
  if (changingStatusId.value !== null) return;

  statusDialog.value = false;
  studentToChange.value = null;
}

async function confirmToggleStatus() {
  if (!studentToChange.value) return;

  const student = studentToChange.value;
  changingStatusId.value = student.id;

  try {
    await studentsService.toggleStatus(student.id);

    showMessage(
      `Estudiante ${student.is_active ? 'desactivado' : 'activado'} correctamente.`,
    );

    statusDialog.value = false;
    studentToChange.value = null;

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

onBeforeUnmount(() => {
  clearTimeout(searchTimeout);
});
</script>

<style scoped>
.page-container {
  width: 100%;
}

.page-header {
  min-height: 55px;
}

.filter-card,
.table-card {
  overflow: hidden;
}

:deep(.v-data-table thead th) {
  font-weight: 600 !important;
  white-space: nowrap;
}

:deep(.v-data-table tbody tr:hover) {
  background: rgba(var(--v-theme-primary), 0.035);
}

@media (max-width: 600px) {
  .page-header {
    align-items: flex-start !important;
  }

  .page-header .v-btn {
    width: 100%;
  }
}
</style>
