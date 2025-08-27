--para remover la numeración de los example, solution, remark
function Div(el)
  -- Si el entorno tiene clase 'example', 'solution', o 'remark', elimina numeración y puntos
  if el.classes:includes("example") or el.classes:includes("examples") or el.classes:includes("fact") or el.classes:includes("solution") or el.classes:includes("remark") or el.classes:includes("definition") or el.classes:includes("theorem") or el.classes:includes("corollary") then
    if #el.content > 0 and el.content[1].t == "Para" then
      local first_para = el.content[1]
      -- Verifica si el primer elemento es <strong> y contiene el número
      if #first_para.content > 0 and first_para.content[1].t == "Strong" then
        -- Remueve el número
        table.remove(first_para.content, 1)
        -- Si el siguiente elemento es un punto (Texto), también lo elimina
        if #first_para.content > 0 and first_para.content[1].t == "Str" and first_para.content[1].text == "." then
          table.remove(first_para.content, 1)
        end
      end
    end
  end
  return el
end