// ── DOCX APR (fiel ao modelo original) ──
async function gerarDocxAPR(montagem) {
  try {
    await carregarDocx();
    const D = window.docx;
    if (!D) {
      alert('Biblioteca docx não carregada. Verifique sua conexão e tente novamente.');
      return;
    }
    const {
      Document,
      Paragraph,
      TextRun,
      Table,
      TableRow,
      TableCell,
      Header,
      Footer,
      Packer,
      WidthType,
      BorderStyle,
      ImageRun,
      PageOrientation,
      AlignmentType,
      VerticalAlign
    } = D;
    function b64ToBytes(dataUri) {
      const base64 = (dataUri || '').split(',')[1] || '';
      const bin = atob(base64);
      const arr = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
      return arr;
    }
    function txt(text, {
      font = 'Arial',
      size = 16,
      bold = false
    } = {}) {
      return new TextRun({
        text: String(text == null ? '' : text),
        font,
        size,
        bold
      });
    }
    function cell(content, {
      widthMm,
      borders,
      shading,
      valign
    } = {}) {
      return new TableCell({
        children: Array.isArray(content) ? content : [content],
        width: widthMm ? {
          size: D.convertMillimetersToTwip(widthMm),
          type: WidthType.DXA
        } : undefined,
        borders,
        shading: shading ? {
          fill: shading
        } : undefined,
        verticalAlign: valign
      });
    }
    function labelValue(label, value) {
      return new Paragraph({
        children: [txt(label, {
          bold: true
        }), txt(value)]
      });
    }
    function numberedList(items, font) {
      if (!items || !items.length) return [new Paragraph({
        children: [txt('', {
          font
        })]
      })];
      return items.map((it, i) => new Paragraph({
        children: [txt(`${i + 1}. ${it}`, {
          font
        })]
      }));
    }
    const noBorder = {
      style: BorderStyle.NONE,
      size: 0,
      color: 'FFFFFF'
    };
    const semBorda = {
      top: noBorder,
      bottom: noBorder,
      left: noBorder,
      right: noBorder
    };
    const linhaFina = {
      style: BorderStyle.SINGLE,
      size: 2,
      color: '999999'
    };
    const comBorda = {
      top: linhaFina,
      bottom: linhaFina,
      left: linhaFina,
      right: linhaFina
    };
    const hojeBR = isoToBR(toISODate(new Date()));

    // ── CABEÇALHO DE PÁGINA (logos + título, repete em todas as páginas) ──
    const headerLogos = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: semBorda,
      rows: [new TableRow({
        children: [cell(new Paragraph({
          children: [new ImageRun({
            type: 'png',
            data: b64ToBytes(window.__LOGO_SRC__),
            transformation: {
              width: 90,
              height: 60
            }
          })]
        }), {
          widthMm: 40,
          borders: semBorda
        }), cell(new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [txt('APR – ANÁLISE PRELIMINAR DE RISCO', {
            bold: true,
            size: 28
          }), new TextRun({
            break: 1
          }), txt((montagem.nome || '').toUpperCase(), {
            bold: true,
            size: 28
          })]
        }), {
          widthMm: 180,
          borders: semBorda,
          valign: VerticalAlign.CENTER
        }), cell(new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [new ImageRun({
            type: 'png',
            data: b64ToBytes(window.__LOGO_SESMT_SRC__),
            transformation: {
              width: 60,
              height: 60
            }
          })]
        }), {
          widthMm: 40,
          borders: semBorda
        })]
      })]
    });

    // ── RODAPÉ DE PÁGINA (bloco de aprovação, repete em todas as páginas) ──
    function blocoAssinatura(titulo) {
      return [new Paragraph({
        children: [txt(titulo, {
          bold: true
        })]
      }), new Paragraph({
        children: [txt('Assinatura: ')]
      }), new Paragraph({
        children: [txt('Data: ')]
      })];
    }
    const footerTable = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: semBorda,
      rows: [new TableRow({
        children: [cell(blocoAssinatura('Coordenador de Obras / Mestre de Obras:'), {
          widthMm: 100,
          borders: semBorda
        }), cell(blocoAssinatura('Encarregado / Líder de obras:'), {
          widthMm: 100,
          borders: semBorda
        }), cell(blocoAssinatura('Técnico de Segurança do Trabalho:'), {
          widthMm: 100,
          borders: semBorda
        })]
      })]
    });

    // ── IDENTIFICAÇÃO ──
    const idRow1 = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: comBorda,
      rows: [new TableRow({
        children: [cell(labelValue('Número da APR: ', montagem.numero), {
          widthMm: 60,
          borders: comBorda
        }), cell(labelValue('Data: ', hojeBR), {
          widthMm: 40,
          borders: comBorda
        }), cell(labelValue('Área: ', montagem.area), {
          widthMm: 80,
          borders: comBorda
        }), cell(labelValue('Responsável pelo SESMT: ', montagem.responsavelSesmt), {
          widthMm: 90,
          borders: comBorda
        }), cell(labelValue('Função: ', montagem.funcao), {
          widthMm: 70,
          borders: comBorda
        })]
      })]
    });
    const idRow2 = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: comBorda,
      rows: [new TableRow({
        children: [cell(labelValue('Assunto / Trabalho: ', montagem.assunto), {
          widthMm: 110,
          borders: comBorda
        }), cell(labelValue('Local: ', montagem.local), {
          widthMm: 90,
          borders: comBorda
        }), cell(labelValue('Data de Início: ', isoToBR(montagem.dataInicio)), {
          widthMm: 70,
          borders: comBorda
        }), cell(labelValue('Término: ', isoToBR(montagem.dataTermino)), {
          widthMm: 70,
          borders: comBorda
        })]
      })]
    });
    const idRow3 = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: comBorda,
      rows: [new TableRow({
        children: [cell(labelValue('Equipamentos e acessórios utilizados: ', montagem.equipamentos), {
          widthMm: 170,
          borders: comBorda
        }), cell(labelValue("EPI's / E.P.C.s: ", montagem.epis), {
          widthMm: 170,
          borders: comBorda
        })]
      })]
    });

    // ── TABELA DE FASES ──
    function celCabecalho(text, widthMm) {
      return cell(new Paragraph({
        children: [txt(text, {
          bold: true
        })]
      }), {
        widthMm,
        borders: comBorda,
        shading: '2A2A2A'
      });
    }
    const fasesHeaderRow = new TableRow({
      tableHeader: true,
      children: [celCabecalho('FASES DA OPERAÇÃO', 39.2), celCabecalho('RISCO DE ACIDENTE', 46.2), celCabecalho('CONSEQUÊNCIAS', 46.2), celCabecalho('MEDIDAS DE SEGURANÇA INDIVIDUAL', 77.2), celCabecalho('MEDIDAS DE SEGURANÇA COLETIVA', 61.5)]
    });
    const fasesRows = (montagem.fases || []).map((f, i) => new TableRow({
      children: [cell(new Paragraph({
        children: [txt(`${i + 1}. ${f.fase}`)]
      }), {
        widthMm: 39.2,
        borders: comBorda
      }), cell(numberedList(f.riscos, 'Verdana'), {
        widthMm: 46.2,
        borders: comBorda
      }), cell(numberedList(f.consequencias, 'Verdana'), {
        widthMm: 46.2,
        borders: comBorda
      }), cell(numberedList(f.medidasIndividuais, 'Arial'), {
        widthMm: 77.2,
        borders: comBorda
      }), cell(numberedList(f.medidasColetivas, 'Arial'), {
        widthMm: 61.5,
        borders: comBorda
      })]
    }));
    const tabelaFases = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: comBorda,
      rows: [fasesHeaderRow, ...fasesRows]
    });

    // ── RECOMENDAÇÕES GERAIS ──
    const recomendacoes = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: comBorda,
      rows: [new TableRow({
        children: [cell(new Paragraph({
          children: [txt('Recomendações Gerais', {
            bold: true
          })]
        }), {
          widthMm: 60,
          borders: comBorda
        }), cell(new Paragraph({
          children: [txt(montagem.recomendacoesGerais)]
        }), {
          widthMm: 220,
          borders: comBorda
        })]
      })]
    });

    // ── EQUIPE DE TRABALHO ──
    const equipeHeader = new TableRow({
      children: [celCabecalho('Nome', 70), celCabecalho('Função', 70), celCabecalho('Assinatura', 70), celCabecalho('Data', 70)]
    });
    const linhaVazia = () => cell(new Paragraph({
      children: [txt('')]
    }), {
      widthMm: 70,
      borders: comBorda
    });
    const equipeBlankRows = Array.from({
      length: 25
    }, () => new TableRow({
      children: [linhaVazia(), linhaVazia(), linhaVazia(), linhaVazia()]
    }));
    const tituloEquipe = new Paragraph({
      spacing: {
        before: 200,
        after: 100
      },
      children: [txt('EQUIPE DE TRABALHO', {
        bold: true
      })]
    });
    const tabelaEquipe = new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE
      },
      borders: comBorda,
      rows: [equipeHeader, ...equipeBlankRows]
    });
    const doc = new Document({
      sections: [{
        properties: {
          page: {
            size: {
              width: D.convertMillimetersToTwip(210),
              height: D.convertMillimetersToTwip(297),
              orientation: PageOrientation.LANDSCAPE
            },
            margin: {
              top: D.convertMillimetersToTwip(35),
              bottom: D.convertMillimetersToTwip(25),
              left: D.convertMillimetersToTwip(25),
              right: D.convertMillimetersToTwip(5)
            }
          }
        },
        headers: {
          default: new Header({
            children: [headerLogos]
          })
        },
        footers: {
          default: new Footer({
            children: [footerTable]
          })
        },
        children: [idRow1, new Paragraph({
          text: ''
        }), idRow2, new Paragraph({
          text: ''
        }), idRow3, new Paragraph({
          text: ''
        }), tabelaFases, new Paragraph({
          text: ''
        }), recomendacoes, tituloEquipe, tabelaEquipe]
      }]
    });
    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nomeArquivo = String(montagem.numero || 'sem-numero').replace(/[^a-zA-Z0-9._-]/g, '_') || 'sem-numero';
    a.download = `${nomeArquivo}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Erro ao gerar DOCX:', err);
    alert('Erro ao gerar DOCX: ' + (err?.message || err));
  }
}
