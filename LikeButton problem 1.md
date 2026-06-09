LikeButton에서 버튼 클릭 시 대략 이런 흐름

    setMessage("");
    setIsLoading(true);

    const response = await fetch(...);

    setLiked(data.liked);
    setLikeCount(data.likeCount);
    onLikeChange?.(...);

    setIsLoading(false);

렌더링이 생기는 이유는 state가 여러 번 바뀌기 때문

대략:
1. 버튼 클릭 전 기본 렌더링
2. setIsLoading(true) 후 렌더링
3. API 응답 후 setLiked, setLikeCount 후 렌더링
4. setIsLoading(false) 후 렌더링

그리고 onLikeChange 때문에 부모인 PostDetailClient의 post state도 바뀌므로, 부모와 자식 쪽 렌더링까지 같이 관찰될 수 있음

중요한 결론은:

> 버튼 클릭 한 번에 3~4번 렌더링되는 것은 문제라고 단정하면 안 됨.

React에서 렌더링은 “DOM 전체를 다시 그린다”가 아니라 “컴포넌트 함수를 다시 실행해서 변경점을 계산한다”에 가깝다

## 지금 해야 할 것

우선 이건 그냥 둬도 되는데

    console.log("LikeButton render", {
    liked,
    likeCount,
    message,
    isLoading,
    });

버튼 클릭 시 어떤 state가 바뀔 때 렌더링되는지 기록해보기


## 줄이고 싶다면

실제로 최적화가 필요할 때는 관련 state를 하나로 묶을 수 있습니다.

현재:

    const [liked, setLiked] = useState(initialLiked);
    const [likeCount, setLikeCount] = useState(initialLikeCount);
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);

이걸 하나의 state로 묶을 수 있습니다.

    const [likeState, setLikeState] = useState({
    liked: initialLiked,
    likeCount: initialLikeCount,
    message: "",
    isLoading: false,
    });

그러면 API 응답 후 한 번에 업데이트할 수 있습니다.

    setLikeState((state) => ({
    ...state,
    liked: data.liked,
    likeCount: data.likeCount,
    isLoading: false,
    }));


## 주의할 점

개발 모드에서는 React Strict Mode 때문에 렌더링 로그가 더 많이 보일 수도 있음  \
그래서 console.log 숫자만 보고 “성능 문제다”라고 판단하면 안 됨

판단 기준

- UI가 느리다
- 입력이 버벅인다
- 리스트가 커서 렌더링 비용이 크다
- React DevTools Profiler에서 실제 병목이 보인다

이런 문제가 없다면 LikeButton의 4번 렌더링은 정상적인 흐름

지금은 “최적화”보다 “렌더링 원인 추적”이 목표