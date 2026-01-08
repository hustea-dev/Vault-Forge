import { ObsidianService } from '../services/ObsidianService.js';
import { TEXT } from '../config/text.js';
import { AppMode } from '../types/constants.js';
import { BaseStrategy } from './BaseStrategy.js';

export class GeneralStrategy extends BaseStrategy {
    protected mode = AppMode.GENERAL;
    protected saveInput = false;
    protected shouldProcessResult = false;
    static readonly supportsDetach = false;
}
