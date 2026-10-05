import re
CAP_HELPER = "const capLead = (n, s) => n ? n + ', ' + s : s.charAt(0).toUpperCase() + s.slice(1);\nconst capJoin = (p, s) => p ? p + ' ' + s : s.charAt(0).toUpperCase() + s.slice(1);\n"
def preprocess(d, i, src):
    """language-neutral rewrite of ru code before translation (output in ru would be identical)"""
    if i == 6:
        reps = []
        if d == 'kompas':
            reps = [
             ("`${N ? N + ', в' : 'В'}се шесть сфер у тебя сейчас звучат примерно одинаково.`",
              "`${capLead(N, 'все шесть сфер у тебя сейчас звучат примерно одинаково.')}`"),
             ("`${N ? N + ', с' : 'С'}ейчас твоя главная опора — ${kq(AREAS[r.strong].name.toLowerCase())}, а тише всего звучит ${kq(AREAS[r.weak].name.toLowerCase())}.`",
              "`${capLead(N, `сейчас твоя главная опора — ${kq(AREAS[r.strong].name.toLowerCase())}, а тише всего звучит ${kq(AREAS[r.weak].name.toLowerCase())}.`)}`"),
             ("${v.myName ? esc(v.myName) + ', т' : 'Т'}вой разбор «Компаса адаптации» от ${when} сохранён</b>",
              "${capLead(v.myName ? esc(v.myName) : '', `твой разбор «Компаса адаптации» от ${when} сохранён`)}</b>"),
             ("${v.myName ? esc(v.myName) + ', т' : 'Т'}ы уже начинала «Компас адаптации» ${when}</b>",
              "${capLead(v.myName ? esc(v.myName) : '', `ты уже начинала «Компас адаптации» ${when}`)}</b>"),
            ]
        if d == 'roza-lyubvi':
            reps = [
             ("`${meSelf ? meSelf + ', в' : 'В'} вашей паре все три составляющие любви сейчас звучат примерно одинаково, на ${Math.round(sum(avg) / 3)} из 40.`",
              "`${capLead(meSelf, `в вашей паре все три составляющие любви сейчас звучат примерно одинаково, на ${Math.round(sum(avg) / 3)} из 40.`)}`"),
             ("`${meSelf ? meSelf + ', с' : 'С'}ильнее всего в вашей паре сейчас звучит ${COMP[strongC].toLowerCase()}, а тише всего — ${COMP[weakC].toLowerCase()}.`",
              "`${capLead(meSelf, `сильнее всего в вашей паре сейчас звучит ${COMP[strongC].toLowerCase()}, а тише всего — ${COMP[weakC].toLowerCase()}.`)}`"),
             ("${who ? who + ', т' : 'Т'}вой разбор «Розы любви» от ${when} сохранён</b>",
              "${capLead(who, `твой разбор «Розы любви» от ${when} сохранён`)}</b>"),
             ("${who ? who + ', т' : 'Т'}ы уже начинала «Розу любви» ${when}</b>",
              "${capLead(who, `ты уже начинала «Розу любви» ${when}`)}</b>"),
            ]
        if d == 'stupeni':
            reps = [
             ("const N = myName ? esc(myName) + ', с' : 'С';", "const NN = myName ? esc(myName) : '';"),
             ("`${N}ейчас твоя опора — вся лестница, все семь ступеней.`", "`${capLead(NN, 'сейчас твоя опора — вся лестница, все семь ступеней.')}`"),
             ("`${N}ейчас твоя опора — ${joinRu(holds.slice(0, 3).map(nm))}.`", "`${capLead(NN, `сейчас твоя опора — ${joinRu(holds.slice(0, 3).map(nm))}.`)}`"),
             ("`${N}ейчас ни одна ступень не держит в полную силу, и это честная точка, с которой можно начать.`", "`${capLead(NN, 'сейчас ни одна ступень не держит в полную силу, и это честная точка, с которой можно начать.')}`"),
             ("`${ctx.stay != null ? SP[ctx.stay] + ', а с' : 'С'}ейчас ты ближе всего к состоянию «${STATES[A.ms][0].toLowerCase()}».`",
              "`${capJoin(ctx.stay != null ? SP[ctx.stay] + ', а' : '', `сейчас ты ближе всего к состоянию «${STATES[A.ms][0].toLowerCase()}».`)}`"),
             ("${v.myName ? esc(v.myName) + ', т' : 'Т'}вой разбор от ${when} сохранён</b>",
              "${capLead(v.myName ? esc(v.myName) : '', `твой разбор от ${when} сохранён`)}</b>"),
             ("${v.myName ? esc(v.myName) + ', т' : 'Т'}ы уже начинала тест ${when}</b>",
              "${capLead(v.myName ? esc(v.myName) : '', `ты уже начинала тест ${when}`)}</b>"),
            ]
        if d == 'blizost':
            reps = [
             ("${NS ? NS + ', т' : 'Т'}ип вашей любви сейчас — «${tName.toLowerCase()}».",
              "${capLead(NS, `тип вашей любви сейчас — «${tName.toLowerCase()}».`)}"),
             ("${who ? who + ', т' : 'Т'}вой разбор «Быть рядом и быть собой» от ${when} сохранён</b>",
              "${capLead(who, `твой разбор «Быть рядом и быть собой» от ${when} сохранён`)}</b>"),
             ("${who ? who + ', т' : 'Т'}ы уже ${gf('начинала', 'начинал')} этот тест ${when}</b>",
              "${capLead(who, `ты уже ${gf('начинала', 'начинал')} этот тест ${when}`)}</b>"),
            ]
        for a, b in reps:
            assert src.count(a) == 1, (d, a[:60], src.count(a))
            src = src.replace(a, b)
        if reps: src = CAP_HELPER + src
    return src
