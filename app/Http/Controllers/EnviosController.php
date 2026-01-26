<?php

namespace App\Http\Controllers;

use App\Models\Envio;
use App\Models\Vehiculo;
use Illuminate\Http\Request;
use Inertia\Inertia;

class EnviosController extends Controller
{
    public function index(Request $request, Vehiculo $vehiculo)
    {
        $envios = Envio::where('vehiculo_id', $vehiculo->placa)
            ->with(['user', 'admin'])
            ->latest()
            ->get();

        return Inertia::render('envios', [
            'vehiculo' => $vehiculo,
            'envios' => $envios,
            'auth' => [
                'user' => $request->user(),
            ],
            'isAdmin' => $request->user()->hasRole('admin'),
        ]);
    }

    public function store(Request $request, Vehiculo $vehiculo)
    {
        $request->validate([
            'descripcion' => 'required|string',
        ]);

        Envio::create([
            'vehiculo_id' => $vehiculo->placa,
            'user_id' => $request->user()->id,
            'descripcion' => $request->descripcion,
            'estado' => 'pendiente',
        ]);

        return redirect()->back()->with('success', 'Solicitud creada correctamente.');
    }

    public function update(Request $request, Vehiculo $vehiculo, Envio $envio)
    {
        $request->validate([
            'estado' => 'required|in:en_camino,rechazado,recibido',
            'foto_envio' => 'nullable|image',
            'foto_recibo' => 'nullable|image',
        ]);

        $data = [
            'estado' => $request->estado,
        ];

        if ($request->estado === 'en_camino') {
            // Admin sending
            $data['admin_id'] = $request->user()->id;
            if ($request->hasFile('foto_envio')) {
                $path = $request->file('foto_envio')->store('envios', 'public');
                $data['foto_envio'] = '/storage/' . $path;
            }
        } elseif ($request->estado === 'recibido') {
            // User receiving
            if ($request->hasFile('foto_recibo')) {
                $path = $request->file('foto_recibo')->store('envios', 'public');
                $data['foto_recibo'] = '/storage/' . $path;
            }
        } elseif ($request->estado === 'rechazado') {
            $data['admin_id'] = $request->user()->id;
        }

        $envio->update($data);

        return redirect()->back()->with('success', 'Estado actualizado.');
    }
}
