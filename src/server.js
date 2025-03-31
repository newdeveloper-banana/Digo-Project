const { Client, GatewayIntentBits } = require('discord.js');
const express = require('express');
require('dotenv').config();  // 환경변수 파일 사용 시 추가

// 환경변수에서 디스코드 봇 토큰을 가져옵니다.
const token = process.env.DISCORD_TOKEN;
const port = process.env.PORT || 3000;  // Express 서버 포트

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const app = express();

// 봇이 준비되었을 때 명령어 등록 및 서버 설정
client.once('ready', async () => {
    console.log('봇이 준비되었습니다!');

    // 봇 명령어 등록
    try {
        await client.application.commands.set([
            {
                name: '고유번호발급',
                description: '고유번호 발급을 시작합니다.'
            },
            {
                name: '고유번호변경',
                description: '고유번호를 변경합니다.'
            },
            {
                name: '팩션역할변경',
                description: '팩션 역할을 변경합니다.'
            }
        ]);
        console.log('명령어가 정상적으로 등록되었습니다.');
    } catch (error) {
        console.error('명령어 등록 실패:', error);
    }

    // 서버가 시작되었음을 콘솔에 출력
    app.listen(port, () => {
        console.log(`HTTP 서버가 포트 ${port}에서 실행 중입니다.`);
    });
});

// 디스코드 봇 명령어 처리
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName } = interaction;

    // 고유번호발급 명령어 처리
    if (commandName === '고유번호발급') {
        await interaction.reply('고유번호 발급을 시작합니다.');
        // 고유번호 발급 처리 로직을 추가합니다.
    }
    // 고유번호변경 명령어 처리
    else if (commandName === '고유번호변경') {
        await interaction.reply('고유번호를 변경합니다.');
        // 고유번호 변경 처리 로직을 추가합니다.
    }
    // 팩션역할변경 명령어 처리
    else if (commandName === '팩션역할변경') {
        await interaction.reply('팩션 역할을 변경합니다.');
        // 팩션 역할 변경 처리 로직을 추가합니다.
    }
});

// 봇 로그인
client.login(token).catch((error) => {
    console.log("봇 로그인 실패:", error);
});
