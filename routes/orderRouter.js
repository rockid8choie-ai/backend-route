import express from "express";

const router = express.Router();

router
  .route("/")
  .get((req, res) => {
    // TODO: 주문 전체 조회
  })
  .post((req, res) => {
    // TODO: 주문 생성
  });

router.patch("/:id/status", (req, res) => {
  // TODO: 주문 상태 변경
});

router.patch("/:id/cancel", (req, res) => {
  // TODO: 주문 취소
});

router
  .route("/:id")
  .get((req, res) => {
    // TODO: 주문 상세 조회
  })
  .delete((req, res) => {
    // TODO: 주문 삭제
  });

export default router;
