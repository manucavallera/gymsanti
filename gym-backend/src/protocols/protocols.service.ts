import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Protocol } from './protocol.entity';

const SEED_PROTOCOLS = [
  {
    title: 'Hidratación durante el entrenamiento',
    category: 'entrenamiento',
    content: `## Hidratación correcta\n\nTomar agua es fundamental para el rendimiento deportivo. Seguí estas pautas:\n\n- **Antes:** Tomá 500ml de agua 2 horas antes del entrenamiento.\n- **Durante:** 150-250ml cada 15-20 minutos.\n- **Después:** Reponé lo perdido (pesate antes y después, cada kg perdido = 1 litro).\n\n### Señales de deshidratación\n- Orina oscura\n- Mareos o náuseas\n- Calambres musculares\n- Rendimiento disminuido`,
  },
  {
    title: 'Protocolo de calentamiento',
    category: 'entrenamiento',
    content: `## Calentamiento obligatorio\n\nNunca arrancés en frío. Seguí este protocolo de 10 minutos antes de cada sesión:\n\n### Cardio leve (5 min)\n- Caminata rápida o trote suave\n- Saltos suaves en el lugar\n\n### Movilidad (5 min)\n- Círculos de cadera: 10 cada lado\n- Rotaciones de hombros: 10 hacia adelante, 10 hacia atrás\n- Sentadilla corporal lenta: 10 reps\n- Hip flexor stretch: 30 segundos cada pierna`,
  },
  {
    title: 'Alimentación pre y post entreno',
    category: 'nutricion',
    content: `## Nutrición peri-entrenamiento\n\n### Pre-entreno (1-2 horas antes)\nNecesitás carbohidratos de fácil digestión y proteína moderada:\n- 🍌 Banana + yogur griego\n- 🍞 Tostadas con queso cottage\n- 🥣 Avena con leche y fruta\n\n### Post-entreno (dentro de los 45 min)\nEl foco es recuperación muscular. Priorizá proteína + carbos:\n- 🍗 Pollo + arroz + verdura\n- 🥚 Huevos revueltos + pan integral\n- 🥛 Shake de proteína + banana\n\n> **Importante:** No entrenés en ayunas si tu objetivo es ganar músculo.`,
  },
  {
    title: 'Rutina de sueño para deportistas',
    category: 'descanso',
    content: `## El sueño es parte del entrenamiento\n\nDormir bien es tan importante como entrenar. El 80% de la recuperación ocurre mientras dormís.\n\n### Recomendaciones\n- **Horas mínimas:** 7-9 horas por noche\n- **Horario consistente:** Dormite y levantate siempre a la misma hora\n- **Sin pantallas:** Apagá dispositivos 1 hora antes de dormir\n- **Temperatura:** El dormitorio debe estar fresco (18-20°C)\n\n### Suplementos que ayudan al sueño\n- Magnesio bisglicinato (300mg antes de dormir)\n- Melatonina 0.5mg (si costás dormirte)`,
  },
];

@Injectable()
export class ProtocolsService implements OnModuleInit {
  constructor(
    @InjectRepository(Protocol)
    private readonly repo: Repository<Protocol>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      for (const p of SEED_PROTOCOLS) {
        await this.repo.save(this.repo.create(p as any));
      }
    }
  }

  findAll() {
    return this.repo.find({ order: { category: 'ASC', createdAt: 'DESC' } });
  }

  findOne(id: number) {
    return this.repo.findOne({ where: { id }, relations: ['coach'] });
  }

  create(coachId: number, data: Partial<Protocol>) {
    const p = this.repo.create({ ...data, coachId });
    return this.repo.save(p);
  }

  async update(id: number, data: Partial<Protocol>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}
