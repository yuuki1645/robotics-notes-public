import pygame
from pygame.locals import *
from OpenGL.GL import *
from OpenGL.GLU import *

pygame.init()
pygame.display.gl_set_attribute(pygame.GL_CONTEXT_MAJOR_VERSION, 2)
pygame.display.gl_set_attribute(pygame.GL_CONTEXT_MINOR_VERSION, 1)
pygame.display.gl_set_attribute(pygame.GL_CONTEXT_PROFILE_MASK,
                                pygame.GL_CONTEXT_PROFILE_CORE)

pygame.display.set_mode((640, 480), DOUBLEBUF | OPENGL)

print("GL_VERSION:", glGetString(GL_VERSION))
print("GL_VENDOR:", glGetString(GL_VENDOR))
print("GL_RENDERER:", glGetString(GL_RENDERER))

pygame.quit()
