import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface SisStudentRecord {
  matricNumber: string;
  fullName: string;
  departmentName: string;
}

/**
 * University Student Information System client — kept behind an interface
 * so it's mockable in tests (backend-architecture.md §14).
 */
@Injectable()
export class SisService {
  private readonly logger = new Logger(SisService.name);
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('SIS_BASE_URL', '');
    this.apiKey = config.get<string>('SIS_API_KEY', '');
  }

  get isConfigured(): boolean {
    return !!this.baseUrl;
  }

  /**
   * Returns the SIS record, `null` if the matric number is confirmed not to
   * exist (404), or throws for anything else (network/5xx) — callers decide
   * whether to fail open or closed on that distinction.
   */
  async lookupStudent(matricNumber: string): Promise<SisStudentRecord | null> {
    if (!this.isConfigured) return null; // not configured yet — fine for scaffolding/dev

    try {
      const response = await axios.get(`${this.baseUrl}/students/${matricNumber}`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
      });
      return response.data ?? null;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      this.logger.warn(`SIS lookup failed for ${matricNumber}: ${(error as Error).message}`);
      throw error;
    }
  }
}
