<!-- resources/views/asignar-admin.blade.php -->
<form method="POST" action="{{ route('asignar-tipo.assign') }}">
    @csrf

    <div class="mb-3">
        <label for="email" class="form-label">Cédula del usuario</label>
        <input type="number" name="email" id="email" class="form-control" required>
    </div>

    <div class="mb-3">
        <label for="tipo" class="form-label">Tipo de vehiculo</label>
        <input type="text" name="tipo" id="tipo" class="form-control" required>
    </div>

    <button type="submit" class="btn btn-primary">Asignar tipo</button>
</form>