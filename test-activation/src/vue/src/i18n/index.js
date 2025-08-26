import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)
// TODO: ru tr vi ar are missing the countdown desc changes
const messages = {
  en: {
    ...require('@stagecast/activation-components/lib/locale/en').default,
    help: {
      howto: [
        'Click on images to earn points and increase your multiplier by +1 every time you hit an image in a row.',
        'Missing an image will reset your multiplier.',
        'Golden images can be clicked several times and you earn 3x more points per click.'
      ]
    },
    intro: {
      title: 'Click the Images',
      subtitle: 'The more images you click in a row, the more points you earn.',
      placeholder: 'Type your name...',
      button: 'Start Game',
      info: 'characters left'
    },
    game: {
      click: "Click the images fast!",
      score: 'Your Score'
    },
    end: {
      round: 'Round',
      header: {
        last: 'Latest Score',
        best: 'Best Score',
        rank: 'Your Rank',
        prizeButton: 'Your Prize',
        playButton: 'Play Again'
      },
      countdown: {
        title: 'Countdown',
        noprize: 'Climb to the top of the leaderboard before the countdown runs out!',
        prizeTopRanking: 'Climb to the <strong>top {num}</strong> of the leaderboard before the countdown runs out!',
        prizeEnoughPoints: 'Reach <strong>{num}</strong>p before the countdown runs out!'
      },
      leaderboard: {
        title: 'Leaderboard',
        loading: 'Loading top scores',
        wait: 'Please wait...',
        updating: 'Updating Live',
        info: 'Play again in order to get ranked on the new leaderboard.',
        empty: 'No one played in this round.'
      }
    }
  },
  it: {
    ...require('@stagecast/activation-components/lib/locale/it').default,
    help: {
      howto: [
        'Premi velocemente sulle immagini per guadagnare punti.',
        'Per ogni immagine premuta il tuo moltiplicatore punti incrementerà di +1.',
        'Il moltiplicatore si azzera ogni volta che premi su un cerchio senza immagine.',
        'Le immagini con un cerchio dorato possono essere cliccate più volte consecutivamente ed  di tre volte il punteggio di ogni click.'
      ]
    },
    intro: {
      title: 'Clicca le immagini',
      subtitle: 'Più immagini premi di seguito, più punti ottieni.',
      placeholder: 'Inserisci il tuo nome...',
      button: 'Gioca',
      info: 'lettere rimaste'
    },
    game: {
      click: "Clicca le immagini veloce!",
      score: 'Punteggio'
    },
    end: {
      round: 'Round',
      header: {
        last: 'Punti',
        best: 'Migliore',
        rank: 'Posizione',
        prizeButton: 'Vai al Premio',
        playButton: 'Gioca Ancora'
      },
      countdown: {
        title: 'Countdown',
        noprize: 'Scala la classifica fino alla vetta prima che finisca il tempo!',
        prizeTopRanking: 'Scala la classifica fino alla <strong>posizione {num}</strong> prima che il tempo finisca!',
        prizeEnoughPoints: 'Raggiungi <strong>{num}</strong>p prima che il tempo finisca!'
      },
      leaderboard: {
        title: 'Classifica',
        loading: 'Caricamento dei risultati...',
        wait: 'Attendere...',
        updating: 'In tempo reale',
        info: 'Partecipa di nuovo al quiz per assicurarti un posto nella classifica.',
        empty: 'Nessuno ha partecipato in questo round.'
      }
    }
  },
  sv: {
    ...require('@stagecast/activation-components/lib/locale/sv').default,
    help: {
      howto: [
        'Klicka på bilder för att få poäng och öka din multiplicerare med 1 varje gång du tar en bild i en rad',
        'Missar du en bild så nollställs din multiplicerare.',
        'Gyllene bilder kan bli klickade på flera gånger och du får tre gånger mer poäng per klick.'
      ]
    },
    intro: {
      title: 'Klicka på bilderna',
      subtitle: 'Ju fler bilder du klickar i en rad, desto mer poäng får du.',
      placeholder: 'Skriv ditt namn...',
      button: 'Starta spelet',
      info: 'tecken kvar'
    },
    game: {
      click: "Klicka på bilderna snabbt!",
      score: 'Dina Poäng'
    },
    end: {
      round: 'Omgång ',
      header: {
        last: 'Senaste Resultat',
        best: 'Bästa Resultat',
        rank: 'Din Ranking',
        prizeButton: 'Din Vinst',
        playButton: 'Börja Om'
      },
      countdown: {
        title: 'Countdown',
        noprize: 'Klättra till toppen av listan innan nedräkningen är över!',
        prizeTopRanking: 'Klättra till <strong>topp {num}</strong> på listan innan nedräkningen är över!',
        prizeEnoughPoints: 'Samla <strong>{num}</strong>p innan nedräkningen är över!'
      },
      leaderboard: {
        title: 'Topplista',
        loading: 'Laddar högsta poängen',
        wait: 'Vänta...',
        updating: 'Uppdateras automatiskt',
        info: 'Spela igen för att ta dig in på resultattavlan',
        empty: 'Ingen har spelat denna runda.'
      }
    }
  },
  de: {
    ...require('@stagecast/activation-components/lib/locale/de').default,
    help: {
      howto: [
        'Klicke auf die Bilder, um Punkte zu erhalten. Wenn du mehrere Bilder hintereinander anklickst erhöht dies deinen Multiplier um +1.',
        'Wenn du daneben klickst, wird dein Multiplier zurückgesetzt.',
        'Goldene Bilder können mehrmals angeklickt werden und du erhältst 3x mehr Punkte pro Klick.'
      ]
    },
    intro: {
      title: 'Klicke auf die Bilder',
      subtitle: 'Je mehr Bilder du hintereinander anklickst, desto mehr Punkte erhältst du.',
      placeholder: 'Dein Name',
      button: 'Spielen',
      info: 'Zeichen'
    },
    game: {
      click: "Klicke schnell auf die Bilder!",
      score: 'Punktzahl'
    },
    end: {
      round: 'Runde',
      header: {
        last: 'Letzte Punktzahl',
        best: 'Beste Punktzahl',
        rank: 'Deine Platzierung',
        prizeButton: 'Dein Preis',
        playButton: 'Nochmal spielen'
      },
      countdown: {
        title: 'Countdown',
        noprize: 'Erreiche die Spitze der Rangliste bevor der Countdown endet.',
        prizeTopRanking: 'Erreiche die <strong>Top {num}</strong> der Rangliste bevor der Countdown endet.',
        prizeEnoughPoints: 'Erziele mindestens <strong>{num}</strong>p bevor der Countdown endet.'
      },
      leaderboard: {
        title: 'Bestenliste',
        loading: 'Lade Top-Platzierungen',
        wait: 'Bitte warten...',
        updating: 'Ergebnisse werden aktualisiert',
        info: 'Spiel nochmal, damit du auf der neuen Rangliste erscheinst.',
        empty: 'In dieser Runde hat niemand teilgenommen.'
      }
    }
  },
  da: {
    ...require('@stagecast/activation-components/lib/locale/da').default,
    help: {
      howto: [
        'Klik på billederne for at optjene point og øge din multiplikator med +1 hver gang du rammer et billede i træk.',
        'Manglende billede nulstiller din multiplikator.',
        'Gyldne billeder kan du klikke på flere gange, og du tjener 3x flere point pr. Klik.'
      ]
    },
    intro: {
      title: 'Klik på billederne',
      subtitle: 'Jo flere billeder du klikker i træk, jo flere point optjener du.',
      placeholder: 'Indtast dit navn ...',
      button: 'Start Spil',
      info: 'tegn tilbage'
    },
    game: {
      click: "Klik på billederne hurtigt!",
      score: 'Din Score'
    },
    end: {
      round: 'Rund',
      header: {
        last: 'Seneste Score',
        best: 'Bedste Score',
        rank: 'Din Rang',
        prizeButton: 'Din Præmie',
        playButton: 'Spil Igen'
      },
      countdown: {
        title: 'Countdown',
        noprize: 'Klatre til toppen af ​​leaderboardet, før nedtællingen løber ud!',
        prizeTopRanking: 'Klatre til <strong>top {num}</strong> på leaderboardet, før nedtællingen løber ud!',
        prizeEnoughPoints: 'Nå <strong>{num}</strong>p inden nedtællingen løber ud!'
      },
      leaderboard: {
        title: 'Leaderboard',
        loading: 'Indlæser topscorer',
        wait: 'Vent venligst...',
        updating: 'Opdatering Live',
        info: 'Spil igen for at blive rangeret på det nye leaderboard.',
        empty: 'Ingen spillede i denne runde.'
      }
    }
  },
  ru: {
    ...require('@stagecast/activation-components/lib/locale/ru').default,
    help: {
      howto: [
        'Нажимайте на изображения, чтобы зарабатывать очки и увеличивать множитель на +1 каждый раз, когда вы нажимаете изображение подряд.',
        'Отсутствие изображения приведет к сбросу множителя.',
        'Золотые изображения можно щелкнуть несколько раз, и вы зарабатываете в 3 раза больше очков за каждый щелчок.'
      ]
    },
    intro: {
      title: 'Щелкните изображения',
      subtitle: 'Чем больше изображений вы нажмете подряд, тем больше очков вы заработаете.',
      placeholder: 'Введите ваше имя...',
      button: 'начать игру',
      info: 'осталось символов'
    },
    game: {
      click: "Быстро нажимайте на изображения!",
      score: 'твой счет'
    },
    end: {
      round: 'круглый',
      header: {
        last: 'Последний счет',
        best: 'Лучший результат',
        rank: 'Ваше звание',
        prizeButton: 'Ваш приз',
        playButton: 'Играть снова'
      },
      countdown: {
        title: 'Обратный отсчет',
        noprize: 'Поднимитесь на вершину таблицы лидеров, пока не закончился обратный отсчет!',
        prizeTopRanking: 'Climb to the <strong>top {num}</strong> of the leaderboard before the countdown runs out!',
        prizeEnoughPoints: 'Достигните <strong> {num} </strong> p до окончания обратного отсчета!'
      },
      leaderboard: {
        title: 'Таблица лидеров',
        loading: 'Загрузка рекордов',
        wait: 'Подождите пожалуйста...',
        updating: 'обновление в прямом эфире',
        info: 'Играйте снова, чтобы попасть в новую таблицу лидеров.',
        empty: 'В этом туре никто не играл.'
      }
    }
  },
  es: {
    ...require('@stagecast/activation-components/lib/locale/es').default,
    help: {
      howto: [
        'Haz clic en las imágenes para ganar puntos y aumentar tu multiplicador en +1 cada vez que golpeas una imagen seguida.',
        'La falta de una imagen restablecerá su multiplicador.',
        'Se puede hacer clic en las imágenes doradas varias veces y gana 3x puntos más por cada clic.'
      ]
    },
    intro: {
      title: 'Haga clic en las imágenes',
      subtitle: 'Cuantas más imágenes haga clic seguidas, más puntos ganará.',
      placeholder: 'Type your name...',
      button: 'Empezar juego',
      info: 'caracteres restantes'
    },
    game: {
      click: "¡Haz clic en las imágenes rápido!",
      score: 'Tu puntuación'
    },
    end: {
      round: 'Ronda',
      header: {
        last: 'Última puntuación',
        best: 'Mejor puntuación',
        rank: 'Mejor puntuación',
        prizeButton: 'Tu premio',
        playButton: 'Juega de nuevo'
      },
      countdown: {
        title: 'cuenta regresiva',
        noprize: '¡Sube a lo más alto de la clasificación antes de que se acabe la cuenta atrás!',
        prizeTopRanking: '¡Sube al <strong>top {num}</strong> de la clasificación antes de que se acabe la cuenta atrás!',
        prizeEnoughPoints: '¡Llega a <strong>{num}</strong>p antes de que acabe la cuenta atrás!'
      },
      leaderboard: {
        title: 'Marcador',
        loading: 'Cargando puntuaciones máximas',
        wait: 'Espere por favor...',
        updating: 'Actualizando en vivo',
        info: 'Juega de nuevo para clasificarte en la nueva clasificación.',
        empty: 'Nadie jugó en esta ronda.'
      }
    }
  },
  fr: {
    ...require('@stagecast/activation-components/lib/locale/fr').default,
    help: {
      howto: [
        'Cliquez sur les images pour gagner des points et augmentez votre multiplicateur de +1 chaque fois que vous touchez une image à la suite.',
        'Manquer une image réinitialisera votre multiplicateur.',
        'Les images dorées peuvent être cliquées plusieurs fois et vous gagnez 3x points supplémentaires par clic.'
      ]
    },
    intro: {
      title: 'Cliquez sur les Images',
      subtitle: 'Plus vous cliquez sur des images à la suite, plus vous gagnez de points.',
      placeholder: 'Tapez votre nom...',
      button: 'Démarrer jeu',
      info: 'caractères restants'
    },
    game: {
      click: "Cliquez vite sur les images !",
      score: 'Ton score'
    },
    end: {
      round: 'Tour',
      header: {
        last: 'Dernière note',
        best: 'Meilleur score',
        rank: 'Ton rang',
        prizeButton: 'Votre prix',
        playButton: 'Rejouer'
      },
      countdown: {
        title: 'Compte à rebours',
        noprize: 'Montez au sommet du classement avant la fin du compte à rebours !',
        prizeTopRanking: 'Montez dans le <strong>top {num}</strong> du classement avant la fin du compte à rebours!',
        prizeEnoughPoints: 'Atteignez <strong>{num}</strong>p avant la fin du compte à rebours!'
      },
      leaderboard: {
        title: 'Classement',
        loading: 'Chargement des meilleurs scores',
        wait: 'S’il vous plaît, attendez...',
        updating: 'Mise à jour en direct',
        info: 'Rejouez pour être classé dans le nouveau classement.',
        empty: 'Personne n’a joué dans ce tour.'
      }
    }
  }
}

const i18n = new VueI18n({
  locale: 'en',
  fallbackLocale: 'en',
  messages
})

export default i18n
