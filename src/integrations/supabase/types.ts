export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agenda_configuracao: {
        Row: {
          created_at: string | null
          dias_semana: number[] | null
          horario_fim: string | null
          horario_inicio: string | null
          horarios_bloqueados: Json | null
          id: string
          intervalo_consulta: number | null
          professional_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          dias_semana?: number[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          horarios_bloqueados?: Json | null
          id?: string
          intervalo_consulta?: number | null
          professional_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          dias_semana?: number[] | null
          horario_fim?: string | null
          horario_inicio?: string | null
          horarios_bloqueados?: Json | null
          id?: string
          intervalo_consulta?: number | null
          professional_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agenda_configuracao_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      atendimentos: {
        Row: {
          clinic_id: string | null
          confirmacao_paciente: boolean | null
          created_at: string | null
          data_fim: string | null
          data_hora: string
          forma_pagamento: string | null
          google_event_id: string | null
          id: string
          lembrete_enviado: boolean | null
          observacoes: string | null
          paciente_id: string | null
          professional_id: string | null
          status: string | null
          tipo_servico: string
          updated_at: string | null
          valor: number | null
        }
        Insert: {
          clinic_id?: string | null
          confirmacao_paciente?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_hora: string
          forma_pagamento?: string | null
          google_event_id?: string | null
          id?: string
          lembrete_enviado?: boolean | null
          observacoes?: string | null
          paciente_id?: string | null
          professional_id?: string | null
          status?: string | null
          tipo_servico: string
          updated_at?: string | null
          valor?: number | null
        }
        Update: {
          clinic_id?: string | null
          confirmacao_paciente?: boolean | null
          created_at?: string | null
          data_fim?: string | null
          data_hora?: string
          forma_pagamento?: string | null
          google_event_id?: string | null
          id?: string
          lembrete_enviado?: boolean | null
          observacoes?: string | null
          paciente_id?: string | null
          professional_id?: string | null
          status?: string | null
          tipo_servico?: string
          updated_at?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "atendimentos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "atendimentos_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clinicas: {
        Row: {
          address: string | null
          cnpj: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          cnpj?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      configuracoes_clinica: {
        Row: {
          assinatura_digital_config: Json | null
          clinic_id: string | null
          created_at: string | null
          google_calendar_token: string | null
          id: string
          nfe_config: Json | null
          payment_gateway_config: Json | null
          updated_at: string | null
          whatsapp_api_token: string | null
        }
        Insert: {
          assinatura_digital_config?: Json | null
          clinic_id?: string | null
          created_at?: string | null
          google_calendar_token?: string | null
          id?: string
          nfe_config?: Json | null
          payment_gateway_config?: Json | null
          updated_at?: string | null
          whatsapp_api_token?: string | null
        }
        Update: {
          assinatura_digital_config?: Json | null
          clinic_id?: string | null
          created_at?: string | null
          google_calendar_token?: string | null
          id?: string
          nfe_config?: Json | null
          payment_gateway_config?: Json | null
          updated_at?: string | null
          whatsapp_api_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "configuracoes_clinica_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      documentos: {
        Row: {
          assinado: boolean | null
          assinatura_digital: string | null
          categoria: string | null
          created_at: string | null
          id: string
          mime_type: string | null
          nome_arquivo: string
          paciente_id: string | null
          professional_id: string | null
          tamanho_arquivo: number | null
          tipo_documento: string
          url: string
        }
        Insert: {
          assinado?: boolean | null
          assinatura_digital?: string | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          mime_type?: string | null
          nome_arquivo: string
          paciente_id?: string | null
          professional_id?: string | null
          tamanho_arquivo?: number | null
          tipo_documento: string
          url: string
        }
        Update: {
          assinado?: boolean | null
          assinatura_digital?: string | null
          categoria?: string | null
          created_at?: string | null
          id?: string
          mime_type?: string | null
          nome_arquivo?: string
          paciente_id?: string | null
          professional_id?: string | null
          tamanho_arquivo?: number | null
          tipo_documento?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documentos_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      log_acoes: {
        Row: {
          acao: string
          created_at: string | null
          dados_anteriores: Json | null
          dados_novos: Json | null
          id: string
          ip_address: unknown | null
          registro_id: string | null
          tabela_afetada: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string | null
          tabela_afetada?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_anteriores?: Json | null
          dados_novos?: Json | null
          id?: string
          ip_address?: unknown | null
          registro_id?: string | null
          tabela_afetada?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "log_acoes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pacientes: {
        Row: {
          ativo: boolean | null
          clinic_id: string | null
          contato_emergencia: Json | null
          convenio: string | null
          cpf: string | null
          created_at: string | null
          data_nascimento: string | null
          email: string | null
          endereco: Json | null
          genero: string | null
          id: string
          nome: string
          numero_convenio: string | null
          observacoes: string | null
          professional_id: string | null
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          clinic_id?: string | null
          contato_emergencia?: Json | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: Json | null
          genero?: string | null
          id?: string
          nome: string
          numero_convenio?: string | null
          observacoes?: string | null
          professional_id?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          clinic_id?: string | null
          contato_emergencia?: Json | null
          convenio?: string | null
          cpf?: string | null
          created_at?: string | null
          data_nascimento?: string | null
          email?: string | null
          endereco?: Json | null
          genero?: string | null
          id?: string
          nome?: string
          numero_convenio?: string | null
          observacoes?: string | null
          professional_id?: string | null
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pacientes_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          atendimento_id: string | null
          created_at: string | null
          data_pagamento: string | null
          data_vencimento: string | null
          forma_pagamento: string
          gateway_response: Json | null
          gateway_transaction_id: string | null
          id: string
          link_pagamento: string | null
          paciente_id: string | null
          parcelamento: Json | null
          status: string | null
          updated_at: string | null
          valor: number
        }
        Insert: {
          atendimento_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          forma_pagamento: string
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          link_pagamento?: string | null
          paciente_id?: string | null
          parcelamento?: Json | null
          status?: string | null
          updated_at?: string | null
          valor: number
        }
        Update: {
          atendimento_id?: string | null
          created_at?: string | null
          data_pagamento?: string | null
          data_vencimento?: string | null
          forma_pagamento?: string
          gateway_response?: Json | null
          gateway_transaction_id?: string | null
          id?: string
          link_pagamento?: string | null
          paciente_id?: string | null
          parcelamento?: Json | null
          status?: string | null
          updated_at?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_atendimento_id_fkey"
            columns: ["atendimento_id"]
            isOneToOne: false
            referencedRelation: "atendimentos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clinic_id: string | null
          created_at: string | null
          crm: string | null
          email: string
          id: string
          name: string
          phone: string | null
          role: string
          specialty: string | null
          updated_at: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string | null
          crm?: string | null
          email: string
          id: string
          name: string
          phone?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string | null
          crm?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          role?: string
          specialty?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
      prontuarios: {
        Row: {
          anexos: string[] | null
          assinado: boolean | null
          assinatura_digital: string | null
          created_at: string | null
          dados_clinicos: Json | null
          data_atendimento: string | null
          id: string
          observacoes: string | null
          paciente_id: string | null
          professional_id: string | null
          template_usado: string | null
          tipo_atendimento: string
          updated_at: string | null
        }
        Insert: {
          anexos?: string[] | null
          assinado?: boolean | null
          assinatura_digital?: string | null
          created_at?: string | null
          dados_clinicos?: Json | null
          data_atendimento?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          professional_id?: string | null
          template_usado?: string | null
          tipo_atendimento: string
          updated_at?: string | null
        }
        Update: {
          anexos?: string[] | null
          assinado?: boolean | null
          assinatura_digital?: string | null
          created_at?: string | null
          dados_clinicos?: Json | null
          data_atendimento?: string | null
          id?: string
          observacoes?: string | null
          paciente_id?: string | null
          professional_id?: string | null
          template_usado?: string | null
          tipo_atendimento?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prontuarios_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prontuarios_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_documentos: {
        Row: {
          ativo: boolean | null
          clinic_id: string | null
          created_at: string | null
          id: string
          nome: string
          template_html: string
          tipo: string
          updated_at: string | null
          variaveis: Json | null
        }
        Insert: {
          ativo?: boolean | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          nome: string
          template_html: string
          tipo: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Update: {
          ativo?: boolean | null
          clinic_id?: string | null
          created_at?: string | null
          id?: string
          nome?: string
          template_html?: string
          tipo?: string
          updated_at?: string | null
          variaveis?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "templates_documentos_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinicas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_access_to_data: {
        Args: { professional_user_id: string }
        Returns: boolean
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
