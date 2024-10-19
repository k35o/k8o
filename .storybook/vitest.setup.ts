import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/nextjs';
import * as projectAnnotations from './preview';

const project = setProjectAnnotations([projectAnnotations]);

beforeAll(project.beforeAll);
