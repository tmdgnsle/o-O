import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export function Textbox() {
  return (
<div className="w-full max-w-3xl mx-auto">
  <div className="flex items-stretch gap-2">
    <Textarea
      placeholder="떠오른 아이디어를 입력해주세요"
      className="flex-1 h-16 min-h-0 resize-none"
    />
    <Button className="h-16 px-5 shrink-0">입력하기</Button>
  </div>
</div>

  )
}
