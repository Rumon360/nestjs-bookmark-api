import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

import * as pactum from 'pactum';
import { LoginDto, SignUpDto } from 'src/auth/dto';
import { EditUserDto } from 'src/user/dto';

describe('App E2E', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const baseUrl = 'http://localhost:4000/api';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    app.setGlobalPrefix('api');
    await app.init();
    await app.listen(4000);
    prisma = app.get(PrismaService);
    await prisma.cleanDb();
    pactum.request.setBaseUrl(baseUrl);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Auth', () => {
    const signUpDto: SignUpDto = {
      email: 'testuser@example.com',
      name: 'Test',
      hashedPassword: 'password',
    };

    const loginDto: LoginDto = {
      email: 'testuser@example.com',
      password: 'password',
    };

    describe('Signup', () => {
      it('Should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ hashedPassword: signUpDto.hashedPassword })
          .expectStatus(400);
      });
      it('Should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ email: signUpDto.email })
          .expectStatus(400);
      });
      it('Should throw error if name empty', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody({ name: signUpDto.name })
          .expectStatus(400);
      });
      it('Should throw error if no body provided', () => {
        return pactum.spec().post('/auth/signup').expectStatus(400);
      });
      it('Should Signup', () => {
        return pactum
          .spec()
          .post('/auth/signup')
          .withBody(signUpDto)
          .expectStatus(201);
      });
    });
    describe('Login', () => {
      it('Should throw error if email empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ password: loginDto.password })
          .expectStatus(400);
      });
      it('Should throw error if password empty', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({ email: loginDto.email })
          .expectStatus(400);
      });
      it('Should throw error if no body provided', () => {
        return pactum.spec().post('/auth/login').expectStatus(400);
      });
      it('Should Login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody(loginDto)
          .expectStatus(200)
          .stores('userAt', 'access_token');
      });
    });
  });
  describe('User', () => {
    describe('Get Me', () => {
      it('Should get the current user', () => {
        return pactum
          .spec()
          .get('/users/me')
          .withBearerToken(`$S{userAt}`)
          .expectStatus(200);
      });
    });
    const editUserDto: EditUserDto = {
      name: 'Edited Name',
      email: 'testuser@example.com',
    };
    describe('Edit Me', () => {
      it('Should edit the current user', () => {
        return pactum
          .spec()
          .patch('/users')
          .withBearerToken(`$S{userAt}`)
          .withBody(editUserDto)
          .expectStatus(200)
          .expectBodyContains(editUserDto.name)
          .expectBodyContains(editUserDto.email);
      });
    });
  });
  describe('Bookmarks', () => {
    describe('Create Bookmark', () => {
      it('Should create a new bookmark', async () => {
        const createBookmarkDto = {
          title: 'Test Bookmark',
          description: 'This is a test bookmark',
          link: 'https://example.com/test',
        };

        await pactum
          .spec()
          .post('/bookmarks')
          .withBearerToken(`$S{userAt}`)
          .withJson(createBookmarkDto)
          .expectStatus(201)
          .stores('bookmarkId', 'id');
      });
    });

    describe('Get Bookmarks', () => {
      it('Should get all bookmarks', () => {
        return pactum
          .spec()
          .get('/bookmarks')
          .withBearerToken(`$S{userAt}`)
          .expectStatus(200)
          .expectJsonLength(1);
      });
    });

    describe('Get Bookmark by ID', () => {
      it('Should get a specific bookmark by ID', () => {
        return pactum
          .spec()
          .get(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withBearerToken(`$S{userAt}`)
          .expectStatus(200);
      });
    });

    describe('Edit Bookmark', () => {
      const editBookmarkDto = {
        title: 'Edited Bookmark Title',
        description: 'Updated description',
        link: 'https://example.com/updated',
      };

      it('Should edit a specific bookmark', () => {
        return pactum
          .spec()
          .patch(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withBearerToken(`$S{userAt}`)
          .withJson(editBookmarkDto)
          .expectStatus(200)
          .expectBodyContains(editBookmarkDto.title)
          .expectBodyContains(editBookmarkDto.description)
          .expectBodyContains(editBookmarkDto.link);
      });
    });

    describe('Delete Bookmark', () => {
      it('Should delete a specific bookmark', () => {
        return pactum
          .spec()
          .delete(`/bookmarks/{id}`)
          .withPathParams('id', `$S{bookmarkId}`)
          .withBearerToken(`$S{userAt}`)
          .expectStatus(200);
      });
    });
  });
});
