## 여기서 볼 수 있는 렌더링 흐름

수정 페이지에 들어가면 대략 이런 흐름을 볼 수 있습니다.

# 첫 렌더링초기값 상태입니다.

title: ""\
content: ""\
message: ""\
isLoading: false\
isSubmitting: false\
isAuthor: false

# useEffect 실행

setIsLoading(true);\
setMessage("");

이후 다시 렌더링됩니다.

# API 응답 성공

setTitle(data.post.title);\
setContent(data.post.content);\
setIsAuthor(true);

여기서 다시 렌더링됩니다.

# finally

setIsLoading(false);

여기서 다시 렌더링됩니다.

즉, LikeButton처럼 여러 번 렌더링되는 현상이 똑같이 보일 수 있습니다.

## 왜 PostEditForm이 더 좋은 학습 예제인가

PostEditForm은 세 가지를 한 번에 볼 수 있습니다.

1. useState 변경으로 인한 렌더링
2. useEffect 실행 시점
3. cleanup 함수 실행 시점

특히 이 부분이 중요합니다.

return () => {
abortController.abort();
};

이 cleanup은 다음 상황에서 실행됩니다.

- 컴포넌트가 사라질 때
- postId가 바뀔 때
- currentUser dependency가 바뀔 때
- 개발 모드 Strict Mode에서 effect 재검증이 일어날 때

## 그런데 여기서 주의할 점

현재 dependency가 이렇게 되어 있습니다.

}, [postId, currentUser]);

currentUser가 객체라면, 부모에서 새 객체로 전달될 때 effect가 다시 실행될 수 있습니다.

더 안정적으로 하려면 이런 식으로 바꿀 수 있습니다.

}, [postId, currentUser.id]);

왜냐하면 effect 안에서 실제로 필요한 값은 currentUser 전체가 아니라 이것뿐이기 때문입니다.

currentUser.id

이건 좋은 학습 포인트입니다.

> dependency array에는 effect 안에서 실제로 사용하는 값을 넣는다.                                                                                                                                                                                                                                                          
