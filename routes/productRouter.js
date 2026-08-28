import express from "express";

const router = express.Router();

router
  .route("/")
  .get((req, res) => {
    // TODO: 상품 전체 조회
  })
  .post((req, res) => {
    // TODO: 상품 생성
  });

router.get("/:productId/orders", (req, res) => {
  // TODO: 특정 상품의 주문 목록 조회
});

router
  .route("/:id")
  .get((req, res) => {
    // TODO: 상품 상세 조회
  })
  .put((req, res) => {
    // TODO: 상품 수정
  })
  .delete((req, res) => {
    // TODO: 상품 삭제
  });

export default router;
