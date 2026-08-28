export default function errorHandler(errName, req, res, next) {
  switch (errName) {
    case "ValidationError":
      return res.status(400).json({ message: "이름과 이메일은 필수입니다." });
    case "NotFoundError":
      return res.status(404).json({ message: "회원을 찾을 수 없습니다." });
    case "ConflictError":
      return res.status(409).json({ message: "이미 사용 중인 이메일입니다." });
    case "FileRequiredError":
      return res.status(400).json({ message: "파일이 필요합니다." });
    case "MulterError":
      return res.status(400).json({ message: "파일 업로드에 실패했습니다." });
    default:
      return res.status(500).json({ message: "서버 내부 오류가 발생했습니다." });
  }
}
