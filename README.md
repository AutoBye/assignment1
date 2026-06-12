## 시작

```bash
npm run dev
```

# DB 설계

## 테이블 구성

     User
    - 회원 정보
    - 로그인 계정 (비밀번호 md5 해쉬처리?)
    - 계정 생성 날짜
    - 게시글, 댓글, 좋아요, 북마크의 주체

    Post
    - 게시글
    - 작성 시간
    - 작성자 User와 연결

    Comment
    - 댓글
    - 작성 시간
    - 게시글과 작성자 User에 연결
    - 대댓글 구조까지 고려 가능

    PostLike
    - 게시글 좋아요
    - 한 사용자가 한 게시글에 한 번만 좋아요 가능

    Bookmark
    - 게시글 북마크
    - 한 사용자가 한 게시글을 한 번만 북마크 가능

prisma/schema.prisma에 코드 넣고 실행

```bash
npx prisma format
npx prisma migrate dev --name init
npx prisma generate
```

.env 포트 확인. 51214가 아니고 5432임

# 예상구조?

    assignment1/
    ├─ app/
    │  ├─ api/
    │  │  ├─ auth/
    │  │  │  ├─ login/
    │  │  │  │  └─ route.ts
    │  │  │  ├─ logout/
    │  │  │  │  └─ route.ts
    │  │  │  └─ register/
    │  │  │     └─ route.ts
    │  │  │
    │  │  ├─ posts/
    │  │  │  ├─ route.ts
    │  │  │  └─ [postId]/
    │  │  │     ├─ route.ts
    │  │  │     ├─ comments/
    │  │  │     │  └─ route.ts
    │  │  │     ├─ like/
    │  │  │     │  └─ route.ts
    │  │      │     └─ bookmark/
    │  │  │        └─ route.ts
    │  │      │
    │  │  └─ users/
    │  │     └─ me/
    │  │        └─ route.ts
    │  │
    │  ├─ posts/
    │  │  ├─ page.tsx
    │  │  ├─ new/
    │  │  │  └─ page.tsx
    │  │  └─ [postId]/
    │  │     ├─ page.tsx
    │  │     └─ edit/
    │  │        └─ page.tsx
    │  │
    │  ├─ login/
    │  │  └─ page.tsx
    │  ├─ register/
    │  │  └─ page.tsx
    │  ├─ layout.tsx
    │  └─ page.tsx
    │
    ├─ components/
    │  ├─ common/
    │  ├─ layout/
    │  ├─ post/
    │  ├─ comment/
    │  └─ auth/
    │
    ├─ lib/
    │  ├─ generated/
    │  │  └─ prisma/
    │  ├─ prisma.ts
    │  ├─ auth.ts
    │  ├─ password.ts
    │  ├─ session.ts
    │  └─ validations/
    │     ├─ auth.ts
    │     ├─ post.ts
    │     └─ comment.ts
    │
    ├─ services/
    │  ├─ auth.service.ts
    │  ├─ post-write.service.ts
    │  ├─ comment.service.ts
    │  ├─ like.service.ts
    │  └─ bookmark.service.ts
    │
    ├─ repositories/
    │  ├─ user.repository.ts
    │  ├─ post.repository.ts
    │  ├─ comment.repository.ts
    │  ├─ post-like.repository.ts
    │  └─ bookmark.repository.ts
    │
    ├─ types/
    │  ├─ auth.ts
    │  ├─ post.ts
    │  └─ comment.ts
    │
    ├─ prisma/
    │  ├─ schema.prisma
    │  └─ migrations/
    │
    ├─ public/
    ├─ .env
    ├─ .env.example
    ├─ package.json
    ├─ tsconfig.json
    ├─ eslint.config.mjs
    ├─ postcss.config.mjs
    └─ next.config.ts

---

    1. DB 영역
        - prisma/schema.prisma
        - lib/prisma.ts
        - lib/generated/prisma

    2. 인증 공통 로직
       - lib/password.ts
       - lib/session.ts
       - lib/auth.ts

    3. API 영역
       - app/api/auth/register/route.ts
       - app/api/auth/login/route.ts
       - app/api/auth/logout/route.ts
       - app/api/auth/me/route.ts

    4. 화면 영역
       - app/page.tsx
       - app/login/page.tsx
       - app/register/page.tsx
       - components/home/PopularPostsSection.tsx
       - components/home/RecentPostsSection.tsx

---

# 더미 유저 생성

seed.ts
package.json에 seed.ts 안넣어두면 못써요잉

    "scripts": {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "eslint",
        "seed": "tsx prisma/seed.ts" <<< 이거 넣어야함
    },

```bash
npm run seed
```
